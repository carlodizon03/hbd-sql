# HBDRepo

`HBDRepo` is a singleton class designed for interacting with [HafSQL](https://mahdiyari.gitlab.io/hafsql/) to manage HBD (Hive Backed Dollars) savings-related operations. It uses [node-postgres](https://node-postgres.com/) library to query the database and retrieve information such as deposits, total interest, savings details, and more.

## Dependency

```
npm i pg
```

## Features

- Singleton design pattern to ensure a single instance of the repository.
- Handles database connection pooling.
- Includes utility functions for querying deposits, interest rates, and savings details.

## Example

```
import { PoolConfig } from 'pg';
import { HBDRepo } from 'hbd-sql/dist';

const poolConfig: PoolConfig = {
  user: `hafsql_public`,
  host: `hafsql-sql.mahdiyari.info`,
  database: `haf_block_log`,
  password: `hafsql_public`,
  port: 5432, 
};

async function main() {
  try {
    // Get the singleton instance of HBDRepo
    const repo = HBDRepo.getInstance(poolConfig);

   console.log('Deposits');
    const deposits = await repo.deposits('your-username');
    console.log('Deposits:', deposits);

    console.log('Withdrawals');
    const withdrawals = await repo.withdrawals('your-username');
    console.log('Withdrawals:', withdrawals);

    console.log('Total Deposit');
    const totalDeposit = await repo.totalDeposit('your-username');
      console.log('Total Deposit:', totalDeposit);

    console.log('Total Withdrawals');
    const totalWithdrawal = await repo.totalWithdrawal('your-username');
    console.log('Total Withdrawal:', totalWithdrawal);

    console.log('Total Interest');
    const totalInterest = await repo.totalInterest('your-username');
    console.log('Total Interest:', totalInterest);

    console.log('Interest Rate');
    const interestRate = await repo.interestRate();
    console.log('Interest Rate:', interestRate ? 'success' : 'failed');

    console.log('Savings Details');
    const savingsDetails = await repo.savingsDetails('your-username');
    console.log('Savings Details:', savingsDetails);

    console.log('Interest Payments');
    const interestPayments = await repo.interestPayments('your-username');
    console.log({ interestPayments });

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

```
