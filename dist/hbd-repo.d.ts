import { config as SqlConfig } from 'mssql';
export declare class HBDRepo {
    private static instance;
    private pool;
    private sqlConfig;
    private constructor();
    static getInstance(sqlConfig: SqlConfig): Promise<HBDRepo>;
    private initializePool;
    private query;
    deposits(username: string): Promise<any[]>;
    totalDeposit(username: string): Promise<number>;
    totalInterest(username: string): Promise<number>;
    interestRate(): Promise<number>;
    savingsDetails(username: string): Promise<any>;
}
