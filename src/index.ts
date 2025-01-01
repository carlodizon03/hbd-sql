import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

/**
 * HBDRepo is a singleton class responsible for interacting with the database
 * to manage HBD savings-related queries and operations.
 */
export class HBDRepo {
  private static instance: HBDRepo;
  private pool: ConnectionPool;
  private sqlConfig: SqlConfig;

  /**
   * Private constructor to ensure only one instance of the repository is created.
   * @param sqlConfig - The SQL configuration object.
   */
  private constructor(sqlConfig: SqlConfig) {
    this.sqlConfig = sqlConfig;
  }

  /**
   * Retrieves the singleton instance of HBDRepo. If it doesn't exist, initializes it.
   * @param sqlConfig - The SQL configuration object.
   * @returns A Promise resolving to the singleton instance of HBDRepo.
   */
  static async getInstance(sqlConfig: SqlConfig): Promise<HBDRepo> {
    if (!HBDRepo.instance) {
      HBDRepo.instance = new HBDRepo(sqlConfig);
      await HBDRepo.instance.initializePool();
    }
    return HBDRepo.instance;
  }

  /**
   * Initializes the connection pool for database interactions.
   * @throws An error if the connection pool fails to initialize.
   */
  private async initializePool(): Promise<void> {
    try {
      this.pool = await sql.connect(this.sqlConfig);
    } catch (error) {
      console.error('Failed to initialize connection pool:', error);
      throw new Error('Database connection failed.');
    }
  }

  /**
   * Executes a query against the database.
   * @param queryString - The SQL query string.
   * @param params - An optional array of parameters to pass to the query.
   * @returns A Promise resolving to an array of records from the query.
   */
  private async query<T extends Record<string, any>>(
    queryString: string,
    params?: any[]
  ): Promise<T[]> {
    try {
      const request = this.pool.request();
      if (params) {
        params.forEach((param, index) => {
          request.input(`param${index + 1}`, param);
        });
      }
      const result = await request.query<T>(queryString);
      return result.recordset; // Return the recordset directly
    } catch (error) {
      console.error('Query execution failed:', error);
      throw new Error('Failed to execute query.');
    }
  }

  /**
   * Retrieves all HBD savings deposit transactions for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to an array of deposit transactions.
   */
  async deposits(username: string): Promise<any[]> {
    const queryString = `
      SELECT tx_id, [type], [from], [to], [amount], [timestamp]
      FROM TxTransfers
      WHERE ([from] = @param1 OR [to] = @param1) 
        AND [type] = 'transfer_to_savings'
      ORDER BY [timestamp] ASC;
    `;
    return await this.query(queryString, [username]);
  }

  /**
   * Calculates the total amount deposited to HBD savings for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to the total deposit amount.
   */
  async totalDeposit(username: string): Promise<number> {
    const queryString = `
      SELECT SUM([amount]) AS total_amount
      FROM TxTransfers
      WHERE ([from] = @param1 OR [to] = @param1)
        AND [type] = 'transfer_to_savings';
    `;
    const result = await this.query<{ total_amount: number }>(queryString, [
      username,
    ]);
    return result[0]?.total_amount || 0;
  }

  /**
   * Calculates the total interest accrued for a user's HBD savings.
   * @param username - The username of the account.
   * @returns A Promise resolving to the total accrued interest.
   */
  async totalInterest(username: string): Promise<number> {
    const queryString = `
      SELECT SUM([interest]) AS total_interest
      FROM VOInterests
      WHERE [owner] = @param1;
    `;
    const result = await this.query<{ total_interest: number }>(queryString, [
      username,
    ]);
    return result[0]?.total_interest || 0;
  }

  /**
   * Retrieves the current HBD interest rate.
   * @returns A Promise resolving to the interest rate as a decimal value.
   */
  async interestRate(): Promise<number> {
    const queryString = `
      SELECT hbd_interest_rate / 100 AS hbd_interest
      FROM DynamicGlobalProperties;
    `;
    const result = await this.query<{ hbd_interest: number }>(queryString);
    return result[0]?.hbd_interest || 0;
  }

  /**
   * Retrieves detailed information about a user's HBD savings account.
   * @param username - The username of the account.
   * @returns A Promise resolving to an object containing savings details.
   */
  async savingsDetails(username: string): Promise<any> {
    const queryString = `
      SELECT 
        hbd_balance,
        savings_hbd_balance,
        savings_hbd_last_interest_payment,
        DATEDIFF(day, savings_hbd_last_interest_payment, GETDATE()) AS last_payment_days,
        ((savings_hbd_balance * 
          (SELECT CAST(hbd_interest_rate AS FLOAT) / 100.0 FROM DynamicGlobalProperties) 
        / 12.0) / 30.0) * 
        DATEDIFF(day, savings_hbd_last_interest_payment, GETDATE()) / 100 AS estimated_interest
      FROM Accounts
      WHERE name = @param1;
    `;
    const result = await this.query(queryString, [username]);
    return result[0] || {};
  }
}
