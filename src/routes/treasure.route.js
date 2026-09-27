import express from "express";
import { createTreasure, getTreasure, getTreasureById, updateTreasure, deleteTreasure } from "../controllers/treasure.controller.js";

const treasureRoutes = express.Router();

treasureRoutes.get("/treasures", getTreasure);
treasureRoutes.get("/treasures/:id", getTreasureById);
treasureRoutes.post("/treasures", createTreasure);
treasureRoutes.put("/treasures/:id", updateTreasure);
treasureRoutes.delete("/treasures/:id", deleteTreasure);

export default treasureRoutes;