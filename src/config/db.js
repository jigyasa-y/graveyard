import pkg from "pg"
import dotenv from "dotenv";
const {Pool}=pkg;

dotenv.config();


 const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

db.on("error",(err)=>{
  console.log("Error in database connection:",err.message);
})





 
export default db;