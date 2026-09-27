import express from "express";
import { buyEquipment,  sellEquipment, sellTreasure } from "../controllers/shop.controller.js";


const shopRoutes = express.Router();

shopRoutes.post("/shop/buy", buyEquipment);
shopRoutes.post("/shop/sell_equipment",  sellEquipment);
shopRoutes.post("/shop/sell_treasure", sellTreasure);



export default shopRoutes;