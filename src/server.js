import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import cors from "cors";
import treasureRoutes from "./routes/treasure.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import equipmentRoutes from "./routes/equipment.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use("/api", treasureRoutes);
app.use("/api",  equipmentRoutes);
app.use("/api", inventoryRoutes);




  const testDB=async ()=>{
  try{
    const result=await db.query("SELECT*from treasure");
    console.log("database is connected");
  } catch (error) {
    console.error("Error connecting to database:", error.message);

  }
};


testDB();

 



  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });


