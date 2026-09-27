import db from "../config/db.js";

export const buyEquipment = async (req, res) => {
  try {
    const { inventory_id, equipment_id, quantity } = req.body;


    if (!inventory_id || !equipment_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "inventory_id, equipment_id and valid quantity are required"
      });
    }

    const equipmentResult = await db.query(
      "SELECT * FROM equipment WHERE id = $1",
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Equipment not found"
      });
    }

    const equipment = equipmentResult.rows[0];

    const totalPrice = equipment.buy_price * quantity;

  
    const inventoryResult = await db.query(
      "SELECT * FROM player_inventory WHERE id = $1",
      [inventory_id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    const inventory = inventoryResult.rows[0];

    if (inventory.money < totalPrice) {
      return res.status(400).json({
        message: "Insufficient money"
      });
    }

    const equipmentInventory = inventory.equipment || [];

    const existingEquipment = equipmentInventory.find(
      item => Number(item.id) === Number(equipment_id)
    );

    if (existingEquipment) {
      existingEquipment.quantity += quantity;
    } else {
      equipmentInventory.push({
        id: equipment_id,
        quantity: quantity
      });
    }


    const remainingMoney = inventory.money - totalPrice;


    const updatedInventory = await db.query(
      `UPDATE player_inventory
       SET equipment = $1,
           money = $2
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(equipmentInventory),
        remainingMoney,
        inventory_id
      ]
    );

    res.status(200).json({
      message: "Equipment purchased successfully",
      equipment: equipment,
      quantity: quantity,
      totalPrice: totalPrice,
      inventory: updatedInventory.rows[0]
    });

  } catch (error) {
    console.error("Buy equipment error:", error);

    res.status(500).json({
      message: "Error buying equipment",
      error: error.message
    });
  }
};

export const sellEquipment = async (req, res) => {
  try {
    const { inventory_id, equipment_id, quantity } = req.body;

    if (!inventory_id || !equipment_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "inventory_id, equipment_id and valid quantity are required"
      });
    }

    const equipmentResult = await db.query(
      "SELECT * FROM equipment WHERE id = $1",
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Equipment not found"
      });
    }

    const equipment = equipmentResult.rows[0];

    const inventoryResult = await db.query(
      "SELECT * FROM player_inventory WHERE id = $1",
      [inventory_id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    const inventory = inventoryResult.rows[0];

    const equipmentInventory = inventory.equipment || [];

    const existingEquipment = equipmentInventory.find(
      item => Number(item.id) === Number(equipment_id)
    );

    if (!existingEquipment) {
      return res.status(400).json({
        message: "Equipment not found in inventory"
      });
    }

    if (existingEquipment.quantity < quantity) {
      return res.status(400).json({
        message: "Not enough equipment in inventory"
      });
    }

    const totalPrice = equipment.sell_price * quantity;

    
    existingEquipment.quantity -= quantity;

  
    const updatedEquipment = equipmentInventory.filter(
      item => item.quantity > 0
    );

    
    const updatedMoney = inventory.money + totalPrice;

  
    const updatedInventory = await db.query(
      `UPDATE player_inventory
       SET equipment = $1,
           money = $2
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(updatedEquipment),
        updatedMoney,
        inventory_id
      ]
    );

    res.status(200).json({
      message: "Equipment sold successfully",
      equipment: equipment,
      quantity: quantity,
      totalPrice: totalPrice,
      inventory: updatedInventory.rows[0]
    });

  } catch (error) {
    console.error("Sell equipment error:", error);

    res.status(500).json({
      message: "Error selling equipment",
      error: error.message
    });
  }
};

export const sellTreasure = async (req, res) => {
  try {
    const { inventory_id, treasure_id, quantity } = req.body;


    if (!inventory_id || !treasure_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "inventory_id, treasure_id and valid quantity are required"
      });
    }


    const treasureResult = await db.query(
      "SELECT * FROM treasure WHERE id = $1",
      [treasure_id]
    );

    if (treasureResult.rows.length === 0) {
      return res.status(404).json({
        message: "Treasure not found"
      });
    }

    const treasure = treasureResult.rows[0];

    const inventoryResult = await db.query(
      "SELECT * FROM player_inventory WHERE id = $1",
      [inventory_id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    const inventory = inventoryResult.rows[0];

    const treasureInventory = inventory.treasure || [];

    const existingTreasure = treasureInventory.find(
      item => Number(item.id) === Number(treasure_id)
    );

    if (!existingTreasure) {
      return res.status(400).json({
        message: "Treasure not found in inventory"
      });
    }

    
    if (existingTreasure.quantity < quantity) {
      return res.status(400).json({
        message: "Not enough treasure in inventory"
      });
    }


    const totalPrice = treasure.value * quantity;


    existingTreasure.quantity -= quantity;

    
    const updatedTreasure = treasureInventory.filter(
      item => item.quantity > 0
    );

    
    const updatedMoney = inventory.money + totalPrice;

  
    const updatedInventory = await db.query(
      `UPDATE player_inventory
       SET treasure = $1,
           money = $2
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(updatedTreasure),
        updatedMoney,
        inventory_id
      ]
    );

    res.status(200).json({
      message: "Treasure sold successfully",
      treasure: treasure,
      quantity: quantity,
      totalPrice: totalPrice,
      inventory: updatedInventory.rows[0]
    });

  } catch (error) {
    console.error("Sell treasure error:", error);

    res.status(500).json({
      message: "Error selling treasure",
      error: error.message
    });
  }
};