import { FilterQuery } from "mongoose";
import { Customer } from "../models/customer.interface";
import { Customer as CustomerModel } from "../models/customer.model";
import { CustomerAnonymised } from "../models/customers-anonymised.model";
import {
  Migration,
  MigrationStatus,
  MigrationType,
} from "../models/migration.model";
import { userService } from "./user.service";
import { migrationService } from "./migration.service";

export class SyncService {
  async beginSingleMigration(startDate?: Date) {
    const migration = migrationService.createMigration(MigrationType.Single);

    const filter: FilterQuery<Customer> = {};

    // in case of continuing previous migration
    if (startDate) {
      filter.createdAt = {
        $gte: startDate,
      };
      // new full migration
    } else {
      const lastMigration = await migrationService.getLastMigration();

      // create new migration after last completed
      if (lastMigration) {
        migration.startDate = lastMigration.endDate;

        filter.createdAt = {
          $lt: migration.endDate,
          $gte: migration.startDate,
        };
      }
    }

    // sync customers by 1000
    const limit = 1000;
    let i = 1;
    migration.inserted = 0;
    await migration.save();

    let customers: Customer[] = await CustomerModel.find(filter, null, {
      lean: true,
      limit,
    });

    try {
      while (customers.length) {
        migration.inserted += customers.length;
        customers = customers.map((c) => userService.anonymiseCustomer(c));
        await CustomerAnonymised.insertMany(customers);
        console.log(`Inserted ${customers.length} customers`);
        customers = await CustomerModel.find(filter, null, {
          lean: true,
          limit,
          skip: i * limit,
        });
        i++;
      }
    } catch (e) {
      console.error("Error while inserting customers", e?.toString());
      migration.status = MigrationStatus.Exited;
      await migration.save();
      return;
    }

    migration.status = MigrationStatus.Completed;
    await migration.save();
  }

  async beginContinuousMigration() {
    const lastMigration = await Migration.findOne({}, null, {
      sort: "-endDate",
    });

    if (lastMigration) {
      // race up to the current moment
      this.beginSingleMigration(lastMigration.endDate)
        .then(() => console.log("Initial migration completed"))
        .catch((e) =>
          console.error("Initial migration failed:", e?.toString())
        );
    }

    // do not wait, start listening to collection
    const migration = migrationService.createMigration(MigrationType.Continuous);
    await migration.save();

    console.log("Listening to changes");
    CustomerModel.watch().on(
      "change",
      (event: { operationType: string; fullDocument: Customer; }) => {
        if (event.operationType === "insert") {
          customers.push(event.fullDocument);
        }
      }
    );

    const customers: Customer[] = [];

    setInterval(async () => {
      if (customers.length) {
        const customersBatch = customers.splice(0, 1000);
        migration.endDate = customersBatch.at(-1)?.createdAt;
        migration.status = MigrationStatus.Completed;

        await Promise.all([
          CustomerAnonymised.insertMany(customersBatch),
          migration.save(),
        ]);
        console.log(`Inserted ${customersBatch.length} customers`);
      }
    }, 1000);

    process.on("exit", async () => {
      migration.status = MigrationStatus.Exited;
      migration.save();
    });
  }
}

export const syncService = new SyncService();
