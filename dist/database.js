"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
const mssql_1 = __importDefault(require("mssql"));
const config = {
    user: process.env.DB_USER || 'Hive-krios003', // Your DB username
    password: process.env.DB_PASSWORD || 'Zo7axMAs5Xema4sY58dE', // Your DB password
    database: process.env.DB_NAME || 'DBHive', // Your DB name
    server: process.env.DB_SERVER || 'vip.hivesql.io', // Your server (e.g., localhost or IP)
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: true, // Use true for Azure
        trustServerCertificate: true, // Use this only in development
    },
};
async function getConnection() {
    return new mssql_1.default.ConnectionPool(config);
}
// getConnection()
//   .then(async (pool) => {
//     const res = await pool.query(
//       `Select * from VOInterests where [owner] = 'krios003' order by [timestamp] asc;`
//     );
//     res.recordset.forEach((set) => {
//       console.log({ set });
//     });
//   })
//   .catch((err) => {
//     console.error({ err });
//   });
