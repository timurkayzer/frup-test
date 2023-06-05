import { faker } from "@faker-js/faker";
import { Customer } from "../models/customer.interface";

export class UserService {
    generateFakeCustomers(count: number): Customer[] {
        const res = [];

        for (let i = 0; i < count; i++) {
            res.push(this.generateSingleFakeCustomer());
        }

        return res;
    }

    generateSingleFakeCustomer(): Customer {
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

    anonymiseCustomer(customer: Customer): Customer {
        customer.address.line1 = faker.string.alpha(8);
        customer.address.line2 = faker.string.alpha(8);
        customer.address.postcode = faker.string.alpha(8);
        customer.firstName = faker.string.alpha(8);
        customer.lastName = faker.string.alpha(8);
        customer.email = faker.string.alpha(8) + customer.email.split('@')[1];

        return customer;
    }
}