import { Migration, MigrationStatus, MigrationType } from "../models/migration.model";

export class MigrationService {

    createMigration(type: MigrationType) {
        return new Migration({
            type,
            endDate: new Date(),
            status: MigrationStatus.Working,
        });
    }

    getLastMigration() {
        return Migration.findOne(
            {
                status: MigrationStatus.Completed,
            },
            null,
            {
                sort: "-createdAt",
            }
        );
    }

}

export const migrationService = new MigrationService();