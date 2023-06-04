import mongoose from "mongoose";
import { customerSchema } from "./customer.model";

export const CustomerAnonymised = mongoose.model('customers_anonymised', customerSchema);