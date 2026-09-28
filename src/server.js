import express from "express";
import dotenv from "dotenv";

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








  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });


