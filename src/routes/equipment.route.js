import exprress from "express";
import { getEquipments, getEquipmentsById, createEquipments, updateEquipments, deleteEquipments } from "../controllers/equipment.controller.js";

const equipmentRoutes = exprress.Router();

equipmentRoutes.get("/equipments", getEquipments);
equipmentRoutes.get("/equipments/:id", getEquipmentsById);
equipmentRoutes.post("/equipments", createEquipments);
equipmentRoutes.put("/equipments/:id", updateEquipments);
equipmentRoutes.delete("/equipments/:id", deleteEquipments);

export default equipmentRoutes;