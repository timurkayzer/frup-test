import { FilterQuery } from "mongoose";
import { Customer } from "../models/customer.interface";
import { Customer as CustomerModel } from "../models/customer.model";
import { CustomerAnonymised } from "../models/customers-anonymised.model";
import { Migration, MigrationStatus, MigrationType } from "../models/migration.model";
import { userService } from "./user.service";

export class SyncService {
    async beginSingleMigration(startDate?: Date) {


        const migration = new Migration({
            type: MigrationType.Single,
            createdAt: new Date(),
            endDate: new Date(),
            status: MigrationStatus.Working
        });

        const filter: FilterQuery<Customer> = {};

        if (startDate) {
            filter.createdAt = {
                $gte: startDate
            };
        }
        else {

            const lastMigration = await Migration.findOne({
                status: MigrationStatus.Completed
            }, null, {
                sort: '-createdAt',
            });

            if (lastMigration) {
                migration.startDate = lastMigration.endDate;

                filter.createdAt = {
                    $lt: migration.endDate,
                    $gte: migration.startDate
                };
            }

        }

        await migration.save();

        let customers = await CustomerModel.find(filter, null, { lean: true }) as Customer[];

        let anonymisedCustomers = customers.map(c => userService.anonymiseCustomer(c));

        CustomerAnonymised.insertMany(anonymisedCustomers);

        migration.inserted = anonymisedCustomers.length;
        migration.status = MigrationStatus.Completed;

        await migration.save();
    }

    async beginContinuousMigration() {
        const lastMigration = await Migration.findOne({
            status: MigrationStatus.Exited,
            type: MigrationType.Continuous
        }, null, { sort: "-endDate" });

        if (lastMigration) {
            // race up to the current moment
            this.beginSingleMigration(lastMigration.endDate)
                .then(() => console.log("Initial migration completed"))
                .catch((e) => console.error("Initial migration failed:", e?.toString()));
        }
        // do not wait, start listening to collection
        const migration = new Migration({
            type: MigrationType.Continuous,
            createdAt: new Date(),
            startDate: new Date(),
            endDate: new Date(),
            status: MigrationStatus.Working
        });

        await migration.save();
        console.log("Listening to changes");
        CustomerModel.watch().on('change', async (event) => {
            console.log(event);
        });

        const customers: Customer[] = [];

        setInterval(async () => {
            if (customers.length) {
                const customersBatch = customers.splice(0, 1000);
                migration.endDate = customersBatch.at(-1)?.createdAt;
                migration.status = MigrationStatus.Completed;

                await Promise.all([
                    CustomerAnonymised.insertMany(customersBatch),
                    migration.save()
                ]);
            }

        }, 1000);

        process.on("SIGTERM", async () => {
            migration.status = MigrationStatus.Exited;
            await migration.save();
        });
    }
}

export const syncService = new SyncService();