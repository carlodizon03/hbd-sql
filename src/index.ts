import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

/**
 * HBDRepo is a singleton class responsible for interacting with the database
 * to manage HBD savings-related queries and operations.
 */
export class HBDRepo {
  private static instance: HBDRepo | null = null;
  private pool: ConnectionPool | null = null;
  private sqlConfig: SqlConfig;

  /**
   * Private constructor to ensure only one instance of the repository is created.
   * @param sqlConfig - The SQL configuration object.
   */
  private constructor(sqlConfig: SqlConfig) {
    if (!sqlConfig) {
      throw new Error('SQL configuration is required to initialize Database.');
    }
    this.sqlConfig = sqlConfig;
  }
  /**
   * Get the singleton instance of the repository.
   * @param sqlConfig - The SQL configuration object (only used for initialization).
   * @returns The singleton instance of the repository.
   */
  public static getInstance(sqlConfig: SqlConfig): HBDRepo {
    if (!HBDRepo.instance) {
      HBDRepo.instance = new HBDRepo(sqlConfig);
    }
    return HBDRepo.instance;
  }

  /**
   * Executes a query against the database.
   * @param queryString - The SQL query string.
   * @param params - An optional array of parameters to pass to the query.
   * @returns A Promise resolving to an array of records from the query.
   */
  public async query<T extends Record<string, any>>(
    queryString: string,
    params?: any[]
  ): Promise<T[]> {
    if (!this.pool) {
      await this.connect();
    }
    try {
      const request = this.pool!.request(); // Use non-null assertion since `this.pool` is ensured to exist.
      if (params) {
        params.forEach((param, index) => {
          request.input(`param${index + 1}`, param);
        });
      }
      const result = await request.query<T>(queryString);
      return result.recordset;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw new Error('Failed to execute query.');
    }
  }
  /**
   * Connect to the database.
   * @returns A Promise resolving to the connection pool.
   */
  private async connect() {
    if (!this.pool) {
      try {
        const connectionPool = new sql.ConnectionPool(this.sqlConfig);
        this.pool = await connectionPool.connect();
        console.log('Database connected');
      } catch (err) {
        console.error('Database connection error:', err);
        throw err;
      }
    }
    return this.pool;
  }

  /**
   * Get the database connection pool.
   * @returns The connection pool.
   */
  public async getConnection(): Promise<ConnectionPool> {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool!;
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
        AND [amount_symbol] = 'HBD'
      ORDER BY [timestamp] ASC;
    `;
    return await this.query(queryString, [username]);
  }

   /**
   * Retrieves all HBD savings withdrawal transactions for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to an array of withdrawal transactions.
   */
  async withrawals(username: string): Promise<any[]> {
    const queryString = `
      SELECT * FROM VOFillTransferFromSavings 
      where ([from]=@param1 or [to]=@param1)
        AND [amount_symbol] = 'HBD'
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
        AND [type] = 'transfer_to_savings'
        AND [amount_symbol] = 'HBD';
    `;
    const result = await this.query<{ total_amount: number }>(queryString, [
      username,
    ]);
    return result[0]?.total_amount || 0;
  }

    /**
   * Calculates the total amount withdrawn from HBD savings for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to the total withdrawn amount.
   */
  async totalWithdrawal(username: string): Promise<number> {
    const queryString = `
      SELECT SUM([amount]) AS total_amount
      FROM VOFillTransferFromSavings 
      where ([from] = @param1 or  [to]=@param1)
        AND [amount_symbol] = 'HBD';
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
