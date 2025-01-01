import { config as SqlConfig } from 'mssql';
/**
 * HBDRepo is a singleton class responsible for interacting with the database
 * to manage HBD savings-related queries and operations.
 */
export declare class HBDRepo {
    private static instance;
    private pool;
    private sqlConfig;
    /**
     * Private constructor to ensure only one instance of the repository is created.
     * @param sqlConfig - The SQL configuration object.
     */
    private constructor();
    /**
     * Retrieves the singleton instance of HBDRepo. If it doesn't exist, initializes it.
     * @param sqlConfig - The SQL configuration object.
     * @returns A Promise resolving to the singleton instance of HBDRepo.
     */
    static getInstance(sqlConfig: SqlConfig): Promise<HBDRepo>;
    /**
     * Initializes the connection pool for database interactions.
     * @throws An error if the connection pool fails to initialize.
     */
    private initializePool;
    /**
     * Executes a query against the database.
     * @param queryString - The SQL query string.
     * @param params - An optional array of parameters to pass to the query.
     * @returns A Promise resolving to an array of records from the query.
     */
    private query;
    /**
     * Retrieves all HBD savings deposit transactions for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to an array of deposit transactions.
     */
    deposits(username: string): Promise<any[]>;
    /**
     * Calculates the total amount deposited to HBD savings for a specific user.
     * @param username - The username of the account.
     * @returns A Promise resolving to the total deposit amount.
     */
    totalDeposit(username: string): Promise<number>;
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
}
