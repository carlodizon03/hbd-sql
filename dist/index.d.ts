import { PoolConfig } from 'pg';
/**
 * HBDRepo is a singleton class responsible for interacting with the database
 * to manage HBD savings-related queries and operations.
 */
export declare class HBDRepo {
    private static instance;
    private pool;
    private poolConfig;
    /**
     * Private constructor to ensure only one instance of the repository is created.
     * @param poolConfig - The PostgreSQL pool configuration object.
     */
    private constructor();
    /**
     * Get the singleton instance of the repository.
     * @param poolConfig - The PostgreSQL pool configuration object (only used for initialization).
     * @returns The singleton instance of the repository.
     */
    static getInstance(poolConfig: PoolConfig): HBDRepo;
    /**
     * Executes a query against the database.
     * @param queryString - The SQL query string.
     * @param params - An optional array of parameters to pass to the query.
     * @returns A Promise resolving to an array of records from the query.
     */
    query<T extends Record<string, any>>(queryString: string, params?: any[]): Promise<T[]>;
    /**
     * Connect to the database.
     * @returns A Promise resolving to the connection pool.
     */
    private connect;
    /**
     * Retrieves all HBD savings deposit transactions for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to an array of deposit transactions.
     */
    deposits(username: string): Promise<any[]>;
    /**
     * Retrieves all HBD savings withdrawal transactions for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to an array of withdrawal transactions.
     */
    withdrawals(username: string): Promise<any[]>;
    /**
     * Calculates the total amount deposited to HBD savings for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to the total deposit amount.
     */
    totalDeposit(username: string): Promise<number>;
    /**
     * Calculates the total amount withdrawn from HBD savings for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to the total withdrawn amount.
     */
    totalWithdrawal(username: string): Promise<number>;
    /**
     * Calculates the total interest accrued for a user's HBD savings.
     * @param username - The username of the account.
     * @returns A Promise resolving to the total accrued interest.
     */
    totalInterest(username: string): Promise<number>;
    /**
     * Retrieves the current HBD interest rate.
     * @returns A Promise resolving to the interest rate as a decimal value.
     */
    interestRate(): Promise<number>;
    /**
     * Retrieves detailed information about a user's HBD savings account.
     * @param username - The username of the account.
     * @returns A Promise resolving to an object containing savings details.
     */
    savingsDetails(username: string): Promise<any>;
    interestPayments(username: string): Promise<any>;
}
