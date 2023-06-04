import mongoose from "mongoose";
import { customerSchemaDescription } from "./customer.schema";

export const customerSchema = new mongoose.Schema(customerSchemaDescription);

export const Customer = mongoose.model('customers', customerSchema);