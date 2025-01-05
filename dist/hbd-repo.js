"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HBDRepo = void 0;
const mssql_1 = __importDefault(require("mssql"));
class HBDRepo {
    static instance;
    pool;
    sqlConfig;
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }
    static async getInstance(sqlConfig) {
        if (!HBDRepo.instance) {
            HBDRepo.instance = new HBDRepo(sqlConfig);
            await HBDRepo.instance.initializePool();
        }
        return HBDRepo.instance;
    }
    async initializePool() {
        try {
            this.pool = await mssql_1.default.connect(this.sqlConfig);
        }
        catch (error) {
            console.error('Failed to initialize connection pool:', error);
            throw new Error('Database connection failed.');
        }
    }
    async query(queryString, params) {
        try {
            const request = this.pool.request();
            if (params) {
                params.forEach((param, index) => {
                    request.input(`param${index + 1}`, param);
                });
            }
            const result = await request.query(queryString);
            return result.recordset; // Return the recordset directly
        }
        catch (error) {
            console.error('Query execution failed:', error);
            throw new Error('Failed to execute query.');
        }
    }
    async deposits(username) {
        const queryString = `
      SELECT tx_id, [type], [from], [to], [amount], [timestamp]
      FROM TxTransfers
      WHERE ([from] = @param1 OR [to] = @param1) 
        AND [type] = 'transfer_to_savings'
      ORDER BY [timestamp] ASC;
    `;
        return this.query(queryString, [username]);
    }
    async totalDeposit(username) {
        const queryString = `
      SELECT SUM([amount]) AS total_amount
      FROM TxTransfers
      WHERE ([from] = @param1 OR [to] = @param1)
        AND [type] = 'transfer_to_savings';
    `;
        const result = await this.query(queryString, [
            username,
        ]);
        return result[0]?.total_amount || 0;
    }
    async totalInterest(username) {
        const queryString = `
      SELECT SUM([interest]) AS total_interest
      FROM VOInterests
      WHERE [owner] = @param1;
    `;
        const result = await this.query(queryString, [
            username,
        ]);
        return result[0]?.total_interest || 0;
    }
    async interestRate() {
        const queryString = `
      SELECT hbd_interest_rate / 100 AS hbd_interest
      FROM DynamicGlobalProperties;
    `;
        const result = await this.query(queryString);
        return result[0]?.hbd_interest || 0;
    }
    async savingsDetails(username) {
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
exports.HBDRepo = HBDRepo;
