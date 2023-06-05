import { FilterQuery } from "mongoose";
import { Customer } from "../models/customer.interface";
import { Customer as CustomerModel } from "../models/customer.model";
import { CustomerAnonymised } from "../models/customers-anonymised.model";
import { Migration, MigrationStatus, MigrationType } from "../models/migration.model";
import { userService } from "./user.service";

export class SyncService {
    async beginSingleMigration() {
        const lastMigration = await Migration.findOne({
            status: MigrationStatus.Completed
        }, null, {
            sort: '-createdAt',
        });

        const migration = new Migration({
            type: MigrationType.Single,
            createdAt: new Date(),
            endDate: new Date(),
            status: MigrationStatus.Working
        });

        const filter: FilterQuery<Customer> = {};

        if (lastMigration) {
            migration.startDate = lastMigration.endDate;
            filter.createdAt = {
                $lt: migration.endDate,
                $gte: migration.startDate
            };
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

    }
}

export const syncService = new SyncService();