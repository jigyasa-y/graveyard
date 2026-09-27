import express from "express";
import { createInventory, getInventory, updateInventory, deleteInventory } from "../controllers/inventory.controller.js";

const inventoryRoutes = express.Router();

inventoryRoutes.post("/inventory", createInventory);
inventoryRoutes.get("/inventory/:id", getInventory);
inventoryRoutes.put("/inventory/:id", updateInventory)
inventoryRoutes.delete("/inventory/:id", deleteInventory);


export default inventoryRoutes;