import { HBDSQL } from "../src/index";
import { PoolConfig } from "pg";

describe("HBDSQL", () => {
  let hbdSQL: HBDSQL;
  const testUsername = "critless";

  const dbConfig: PoolConfig = {
    user: "hafsql_public",
    password: "hafsql_public",
    database: "haf_block_log",
    host: "hafsql-sql.mahdiyari.info",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  beforeAll(() => {
    hbdSQL = HBDSQL.getInstance(dbConfig);
  });

  afterAll(async () => {
    // Clean up any open connections
    if ((hbdSQL as any).pool) {
      await (hbdSQL as any).pool.end();
    }
  });

  describe("Singleton Pattern", () => {
    test("should return the same instance when getInstance is called multiple times", () => {
      const instance1 = HBDSQL.getInstance(dbConfig);
      const instance2 = HBDSQL.getInstance(dbConfig);
      expect(instance1).toBe(instance2);
    });

    test("should throw error when initialized without config", () => {
      expect(() => {
        (HBDSQL as any).instance = null; // Reset for test
        HBDSQL.getInstance(null as any);
      }).toThrow(
        "PostgreSQL configuration is required to initialize Database."
      );
    });
  });

  describe("Database Operations", () => {
    test("should retrieve HBD deposits for user", async () => {
      const deposits = await hbdSQL.deposits(testUsername);

      console.log(
        "Sample deposit record:",
        JSON.stringify(deposits[0], null, 2)
      );

      expect(Array.isArray(deposits)).toBe(true);
      if (deposits.length > 0) {
        const deposit = deposits[0];
        expect(deposit).toHaveProperty("timestamp");
        expect(deposit).toHaveProperty("from_account");
        expect(deposit).toHaveProperty("to_account");
        expect(deposit).toHaveProperty("amount");
        expect(deposit).toHaveProperty("symbol");
        expect(deposit.symbol).toBe("HBD");
      }
    }, 10000);

    test("should retrieve HBD withdrawals for user", async () => {
      const withdrawals = await hbdSQL.withdrawals(testUsername);

      console.log(
        "Sample withdrawal record:",
        JSON.stringify(withdrawals[0], null, 2)
      );

      expect(Array.isArray(withdrawals)).toBe(true);
      if (withdrawals.length > 0) {
        const withdrawal = withdrawals[0];
        expect(withdrawal).toHaveProperty("timestamp");
        expect(withdrawal).toHaveProperty("from_account");
        expect(withdrawal).toHaveProperty("amount");
        expect(withdrawal).toHaveProperty("symbol");
        expect(withdrawal.symbol).toBe("HBD");
      }
    }, 10000);

    test("should calculate total deposit amount", async () => {
      const totalDeposit = await hbdSQL.totalDeposit(testUsername);

      console.log("Total deposit amount:", totalDeposit);

      expect(typeof totalDeposit).toBe("number");
      expect(totalDeposit).toBeGreaterThanOrEqual(0);
    }, 10000);

    test("should calculate total withdrawal amount", async () => {
      const totalWithdrawal = await hbdSQL.totalWithdrawal(testUsername);

      console.log("Total withdrawal amount:", totalWithdrawal);

      expect(typeof totalWithdrawal).toBe("number");
      expect(totalWithdrawal).toBeGreaterThanOrEqual(0);
    }, 10000);

    test("should calculate total interest accrued", async () => {
      const totalInterest = await hbdSQL.totalInterest(testUsername);

      console.log("Total interest:", totalInterest);

      expect(typeof totalInterest).toBe("number");
      expect(totalInterest).toBeGreaterThanOrEqual(0);
    }, 10000);

    test("should retrieve current HBD interest rate", async () => {
      const interestRate = await hbdSQL.interestRate();

      console.log("Current interest rate:", interestRate);

      expect(typeof interestRate).toBe("number");
      expect(interestRate).toBeGreaterThanOrEqual(0);
      expect(interestRate).toBeLessThanOrEqual(100); // Interest rate as percentage
    }, 10000);

    test("should retrieve savings details for user", async () => {
      const savingsDetails = await hbdSQL.savingsDetails(testUsername);

      console.log("Savings details:", JSON.stringify(savingsDetails, null, 2));

      expect(typeof savingsDetails).toBe("object");
      if (Object.keys(savingsDetails).length > 0) {
        expect(savingsDetails).toHaveProperty("hbd");
        expect(savingsDetails).toHaveProperty("hbd_savings");
        expect(savingsDetails).toHaveProperty("last_payment_date");
        expect(savingsDetails).toHaveProperty("estimated_interest");
      }
    }, 10000);

    test("should retrieve interest payments for user", async () => {
      const interestPayments = await hbdSQL.interestPayments(testUsername);

      console.log(
        "Sample interest payment:",
        JSON.stringify(interestPayments[0], null, 2)
      );

      expect(Array.isArray(interestPayments)).toBe(true);
      if (interestPayments.length > 0) {
        const payment = interestPayments[0];
        expect(payment).toHaveProperty("timestamp");
        expect(payment).toHaveProperty("owner");
        expect(payment).toHaveProperty("interest");
        expect(payment.owner).toBe(testUsername);
      }
    }, 10000);
  });

  describe("Error Handling", () => {
    test("should handle database connection errors gracefully", async () => {
      const badConfig: PoolConfig = {
        user: "invalid_user",
        password: "invalid_password",
        database: "invalid_db",
        host: "invalid_host",
        port: 5432,
      };

      const badInstance = HBDSQL.getInstance(badConfig);

      await expect(badInstance.deposits("test")).rejects.toThrow();
    }, 10000);

    test("should handle empty results gracefully", async () => {
      const nonExistentUser = "nonexistentuser12345";

      const deposits = await hbdSQL.deposits(nonExistentUser);
      const withdrawals = await hbdSQL.withdrawals(nonExistentUser);
      const totalDeposit = await hbdSQL.totalDeposit(nonExistentUser);
      const totalWithdrawal = await hbdSQL.totalWithdrawal(nonExistentUser);
      const totalInterest = await hbdSQL.totalInterest(nonExistentUser);

      expect(Array.isArray(deposits)).toBe(true);
      expect(Array.isArray(withdrawals)).toBe(true);
      expect(totalDeposit).toBe(0);
      expect(totalWithdrawal).toBe(0);
      expect(totalInterest).toBe(0);
    }, 10000);
  });
});
