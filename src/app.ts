// create users

import { dbConnect } from "./db-connect";
import { Customer } from "./models/customer.model";
import { UserService } from "./services/user.service";
const userService = new UserService;

dbConnect().then(() => {
    setInterval(async () => {
        try {
            let customers = userService.generateFakeUsers(200);
            await Customer.insertMany(customers);
        }
        catch (e) {
            console.error(e?.toString());
        }
    }, 1000);
})
    .catch(e => console.error(e?.toString()));

