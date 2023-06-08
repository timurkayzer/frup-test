import mongoose from "mongoose";

export enum MigrationType {
  Single = "single",
  Continuous = "continuous",
}

export enum MigrationStatus {
  Completed = "completed",
  Working = "working",
  Exited = "exited",
}

export const migrationSchema = new mongoose.Schema({
  type: String, // MigrationType
  createdAt: Date,
  startDate: Date,
  endDate: Date,
  inserted: Number,
  status: String, // MigrationStatus
});

export const Migration = mongoose.model("migrations", migrationSchema);
