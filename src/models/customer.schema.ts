import { Customer } from "./customer.interface";

export const customerSchemaDescription = {
    firstName: String,
    lastName: String,
    email: String,
    address: {
        line1: String,
        line2: String,
        postcode: String,
        city: String,
        state: String,
        country: String
    },
    createdAt: Date
};