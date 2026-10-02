import express from "express";
import { createInventory,consumeLoadoutEquipment, getPlayerData,sellTreasures, buyEquipment,getInventory, updateInventory, deleteInventory } from "../controllers/inventory.controller.js";

const inventoryRoutes = express.Router();

inventoryRoutes.post("/inventory", createInventory);
inventoryRoutes.get("/inventory/:id", getInventory);
inventoryRoutes.put("/inventory/:id", updateInventory)
inventoryRoutes.delete("/inventory/:id", deleteInventory);
inventoryRoutes.get("/player/:id", getPlayerData);

  inventoryRoutes.post("/inventory/:id/sell",sellTreasures);
inventoryRoutes.post("/inventory/:id/consume-loadout",consumeLoadoutEquipment);
inventoryRoutes.post("/inventory/:id/purchase",buyEquipment);
export default inventoryRoutes;