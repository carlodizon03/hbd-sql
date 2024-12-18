# HBDRepo

`HBDRepo` is a singleton class designed for interacting with [HiveSQL](https://hivesql.io/) to manage HBD (Hive Backed Dollars) savings-related operations. It uses [node-mssql](https://github.com/tediousjs/node-mssql) library to query the database and retrieve information such as deposits, total interest, savings details, and more.

## Features

- Singleton design pattern to ensure a single instance of the repository.
- Handles database connection pooling.
- Includes utility functions for querying deposits, interest rates, and savings details.

## Example

```
import { config as SqlConfig } from 'mssql';
import { HBDRepo } from './HBDRepo';

const sqlConfig: SqlConfig = {
  user: 'your-db-username',
  password: 'your-db-password',
  server: 'your-db-server',
  database: 'your-database',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function main() {
  try {
    // Get the singleton instance of HBDRepo
    const repo = await HBDRepo.getInstance(sqlConfig);

    // Example: Retrieve deposits for a user
    const username = 'example_user';
    const deposits = await repo.deposits(username);
    console.log('User Deposits:', deposits);

    // Example: Retrieve total deposits for a user
    const totalDeposit = await repo.totalDeposit(username);
    console.log('Total Deposits:', totalDeposit);

    // Example: Retrieve total interest for a user
    const totalInterest = await repo.totalInterest(username);
    console.log('Total Interest:', totalInterest);

    // Example: Retrieve current interest rate
    const interestRate = await repo.interestRate();
    console.log('Interest Rate:', interestRate);

    // Example: Retrieve savings details for a user
    const savingsDetails = await repo.savingsDetails(username);
    console.log('Savings Details:', savingsDetails);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

```
