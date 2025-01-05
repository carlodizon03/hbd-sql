import { Pool, PoolConfig, QueryResult } from 'pg';

/**
 * HBDRepo is a singleton class responsible for interacting with the database
 * to manage HBD savings-related queries and operations.
 */
export class HBDRepo {
  private static instance: HBDRepo | null = null;
  private pool: Pool | null = null;
  private poolConfig: PoolConfig;

  /**
   * Private constructor to ensure only one instance of the repository is created.
   * @param poolConfig - The PostgreSQL pool configuration object.
   */
  private constructor(poolConfig: PoolConfig) {
    if (!poolConfig) {
      throw new Error(
        'PostgreSQL configuration is required to initialize Database.'
      );
    }
    this.poolConfig = poolConfig;
  }

  /**
   * Get the singleton instance of the repository.
   * @param poolConfig - The PostgreSQL pool configuration object (only used for initialization).
   * @returns The singleton instance of the repository.
   */
  public static getInstance(poolConfig: PoolConfig): HBDRepo {
    if (!HBDRepo.instance) {
      HBDRepo.instance = new HBDRepo(poolConfig);
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
      const result: QueryResult<T> = await this.pool!.query(
        queryString,
        params
      );
      return result.rows;
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
        this.pool = new Pool(this.poolConfig);
        console.log('Database connected');
      } catch (err) {
        console.error('Database connection error:', err);
        throw err;
      }
    }
    return this.pool;
  }

  /**
   * Retrieves all HBD savings deposit transactions for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to an array of deposit transactions.
   */
  async deposits(username: string): Promise<any[]> {
    const queryString = `
          SELECT *, hafsql.get_timestamp(id) AS timestamp
        FROM hafsql.operation_transfer_to_savings_table
        WHERE (from_account = $1 or  to_account = $1 ) AND symbol = 'HBD' 
         ORDER BY timestamp ASC;
    `;
    return await this.query(queryString, [username]);
  }

  /**
   * Retrieves all HBD savings withdrawal transactions for a specific user.
   * @param username - The username of the account.
   * @returns A Promise resolving to an array of withdrawal transactions.
   */
  async withdrawals(username: string): Promise<any[]> {
    const queryString = `
         SELECT * , hafsql.get_timestamp(id) AS timestamp
          FROM hafsql.operation_fill_transfer_from_savings_table
          WHERE from_account = $1
          AND symbol = 'HBD' ORDER BY timestamp ASC;

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
      SELECT SUM(amount) as total_amount
      FROM hafsql.operation_transfer_to_savings_table
      WHERE (from_account = $1 or  to_account = $1 ) AND symbol = 'HBD' 
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
     SELECT SUM(amount) AS total_amount
      FROM hafsql.operation_fill_transfer_from_savings_table
      WHERE from_account = $1
        AND symbol= 'HBD'
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
       SELECT SUM(interest) AS total_interest
        FROM hafsql.operation_interest_table
        WHERE owner = $1;
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
      SELECT  ROUND((CAST(hbd_interest_rate AS numeric) / 100),2) AS hbd_interest 
      FROM hafsql.dynamic_global_properties
      ORDER BY timestamp DESC
      LIMIT 1;
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
            WITH 
            last_payment AS (
                SELECT hafsql.get_timestamp(id) AS last_payment_timestamp
                FROM hafsql.operation_interest_table 
                WHERE owner = $1 
                ORDER BY last_payment_timestamp DESC 
                LIMIT 1
            ),
            interest_rate AS (
                SELECT ROUND(CAST(hbd_interest_rate AS numeric) / 100, 2) AS hbd_interest
                FROM hafsql.dynamic_global_properties
                ORDER BY timestamp DESC 
                LIMIT 1
            )

            SELECT 
                hbd,
                hbd_savings,
                -- Calculate the number of days since the last payment date
                EXTRACT(DAY FROM (NOW() - (SELECT last_payment_timestamp FROM last_payment))) AS last_payment_days,

                -- Calculating the estimated interest
                ROUND(((hbd_savings * 
                        (SELECT hbd_interest FROM interest_rate) 
                        / 12.0) / 30.0) * 
                      EXTRACT(DAY FROM (NOW() - (SELECT last_payment_timestamp FROM last_payment))) 
                      / 100, 2) AS estimated_interest
            FROM hafsql.balances
            WHERE account_name = $1;
    `;
    const result = await this.query(queryString, [username]);
    return result[0] || {};
  }

  async interestPayments(username: string): Promise<any> {
    const queryString = `
      SELECT *, hafsql.get_timestamp(id) AS timestamp FROM hafsql.operation_interest_table
      where owner = $1;
    `;
    return await this.query(queryString, [username]);
  }
}
