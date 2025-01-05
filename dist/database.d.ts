import { ConnectionPool } from 'mssql';
export declare function getConnection(): Promise<ConnectionPool>;
