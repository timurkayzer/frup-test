import { faker } from "@faker-js/faker";
import { Customer } from "../models/customer.interface";

export class UserService {
    generateFakeUsers(count: number): Customer[] {
        const res = [];

        for (let i = 0; i < count; i++) {
            res.push(this.generateSingleFakeUser());
        }

        return res;
    }

    generateSingleFakeUser(): Customer {
        return {
            address: {
                city: faker.location.city(),
                country: faker.location.country(),
                line1: faker.location.street(),
                line2: faker.location.street(),
                postcode: faker.number.int().toString(),
                state: faker.location.state()
            },
            createdAt: new Date(),
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName()
        };
    }
}