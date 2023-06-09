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
  startDate: {
    type: Date,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  inserted: Number,
  status: String, // MigrationStatus
}, { timestamps: true });

migrationSchema.index({ 'createdAt': 1 });


export const Migration = mongoose.model("migrations", migrationSchema);
