import express from "express";
import { getAllEquipment,  sellEquipment, sellTreasure } from "../controllers/shop.controller.js";


const shopRoutes = express.Router();

shopRoutes.post("/shop/sell_equipment",  sellEquipment);
shopRoutes.post("/shop/sell_treasure", sellTreasure);
shopRoutes.get(
  "/equipment",
  getAllEquipment
);


export default shopRoutes;