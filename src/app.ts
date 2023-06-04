// create users

import { dbConnect } from "./db-connect";
import { Customer } from "./models/customer.model";
import { UserService } from "./services/user.service";
const userService = new UserService;

dbConnect().then(() => {
    setInterval(async () => {
        const customerCount = Math.round((Math.random() * 11) % 11);
        try {
            let customers = userService.generateFakeUsers(customerCount);
            await Customer.insertMany(customers);
        }
        catch (e) {
            console.error(e?.toString());
        }
    }, 200);
})
    .catch(e => console.error(e?.toString()));

