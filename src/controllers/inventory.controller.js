import db from "../config/db.js";

export const createInventory = async (req, res) => {
  try {
    const { treasure = [], equipment = [], money = 0 } = req.body;

    const result = await db.query(
      `INSERT INTO player_inventory (treasure, equipment, money)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [JSON.stringify(treasure), JSON.stringify(equipment), money]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ message: "Failed to create inventory" });
  }
};

export const getInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM player_inventory WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ message: "Failed to get inventory" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { treasure, equipment, money } = req.body;

    const result = await db.query(
      `UPDATE player_inventory
       SET treasure = $1,
           equipment = $2,
           money = $3
       WHERE id = $4
       RETURNING *`,
      [
        JSON.stringify(treasure),
        JSON.stringify(equipment),
        money,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ message: "Failed to update inventory" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM player_inventory
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({
      message: "Inventory deleted successfully",
      inventory: result.rows[0]
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({ message: "Failed to delete inventory" });
  }
};