import mongoose from "mongoose";
import { customerSchemaDescription } from "./customer.schema";

export const customerSchema = new mongoose.Schema(customerSchemaDescription, { timestamps: true });
customerSchema.index({ 'createdAt': 1 });

export const Customer = mongoose.model("customers", customerSchema);
