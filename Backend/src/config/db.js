import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log("=== DB Connection Debug ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD length:", process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log("===========================");


const bdd = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: {
        rejectUnauthorized: false // Questa riga è fondamentale per Aiven
    }
});

export default bdd;
