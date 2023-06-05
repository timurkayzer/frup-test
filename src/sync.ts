import { dbConnect } from "./db-connect";
import { syncService } from "./services/sync.service";

dbConnect().then(
    async () => {
        if (process.argv.includes("--full-reindex")) {
            await syncService.beginSingleMigration();
            console.log("Migration completed");
            process.exit(0);
        }
        else {
            // setInterval and finish
            // begin listening from now
            await syncService.beginContinuousMigration();
        }
    }
);
