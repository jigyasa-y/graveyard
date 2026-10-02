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
    console.log("Equipment test log :"+equipment);
    console.log("Treasure test log :"+treasure);

    const result = await db.query(
      `
      UPDATE player_inventory
      SET
        treasure = CASE
          WHEN $1::jsonb IS NOT NULL
          THEN COALESCE(treasure, '[]'::jsonb) || $1::jsonb
          ELSE treasure
        END,

        equipment = CASE
          WHEN $2::jsonb IS NOT NULL
          THEN COALESCE(equipment, '[]'::jsonb) || $2::jsonb
          ELSE equipment
        END,

        money = CASE
          WHEN $3::integer IS NOT NULL
          THEN COALESCE(money, 0) + $3::integer
          ELSE money
        END

      WHERE id = $4
      RETURNING *
      `,
      [
        treasure !== undefined
          ? JSON.stringify(treasure)
          : null,

        equipment !== undefined
          ? JSON.stringify(equipment)
          : null,

        money !== undefined
          ? money
          : null,

        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(
      "Update inventory error:",
      error
    );

    res.status(500).json({
      message: "Failed to update inventory",
      error: error.message
    });
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


export const getPlayerData = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================================================
    // GET PLAYER INVENTORY
    // =========================================================

    const inventoryResult = await db.query(
      `SELECT id, treasure, equipment, money
       FROM player_inventory
       WHERE id = $1`,
      [id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Player not found"
      });
    }

    const player = inventoryResult.rows[0];


    // =========================================================
    // TREASURE
    // =========================================================

    const treasureArray =
      player.treasure || [];

    let treasures = [];

    if (treasureArray.length > 0) {

      const treasureIds =
        treasureArray.map(itemId =>
          String(itemId)
        );


      // Count treasure quantities
      const treasureQuantityMap = {};

      for (const itemId of treasureIds) {
        treasureQuantityMap[itemId] =
          (treasureQuantityMap[itemId] || 0) + 1;
      }


      // Fetch treasure details
      const treasureResult = await db.query(
        `SELECT
            id,
            item_id,
            name,
            description,
            rarity,
            value
         FROM treasure
         WHERE item_id = ANY($1::text[])`,
        [treasureIds]
      );


      // Add quantity
      treasures =
        treasureResult.rows.map(
          treasure => ({
            ...treasure,
            quantity:
              treasureQuantityMap[
                String(treasure.item_id)
              ] || 0
          })
        );
    }


    // =========================================================
    // EQUIPMENT
    // =========================================================

    const equipmentArray =
      player.equipment || [];

    let equipment = [];

    if (equipmentArray.length > 0) {

      const equipmentIds =
        equipmentArray.map(itemId =>
          String(itemId)
        );


      // Count equipment quantities
      const equipmentQuantityMap = {};

      for (const itemId of equipmentIds) {
        equipmentQuantityMap[itemId] =
          (equipmentQuantityMap[itemId] || 0) + 1;
      }


      // Fetch equipment details
      const equipmentResult = await db.query(
        `SELECT
            id,
            item_id,
            name,
            description,
            price
  
         FROM equipment
         WHERE item_id = ANY($1::text[])`,
        [equipmentIds]
      );


      // Add quantity
      equipment =
        equipmentResult.rows.map(
          item => ({
            ...item,
            quantity:
              equipmentQuantityMap[
                String(item.item_id)
              ] || 0
          })
        );
    }


    // =========================================================
    // FINAL PLAYER DATA
    // =========================================================

    res.status(200).json({
      id: player.id,
      money: player.money,

      treasures: treasures,

      equipment: equipment
    });

  } catch (error) {

    console.error(
      "Get player data error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch player data",
      error: error.message
    });
  }
};

export const sellTreasures = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No items to sell"
      });
    }

    await client.query("BEGIN");

    // Get current player inventory
    const inventoryResult = await client.query(
      `SELECT treasure, money
       FROM player_inventory
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (inventoryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    const currentTreasure =
      inventoryResult.rows[0].treasure || [];

    // Convert current IDs to strings
    let remainingTreasure =
      currentTreasure.map(item => String(item));

    // Remove requested quantities
    for (const item of items) {
      const itemId = String(item.itemId);
      const quantity = Number(item.quantity);

      for (let i = 0; i < quantity; i++) {
        const index =
          remainingTreasure.indexOf(itemId);

        if (index === -1) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            message:
              "Player does not have enough of item " +
              itemId
          });
        }

        remainingTreasure.splice(index, 1);
      }
    }

    // Update inventory
    const updateResult = await client.query(
      `UPDATE player_inventory
       SET treasure = $1::jsonb,
           money = money + $2
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(
          remainingTreasure.map(Number)
        ),
        Number(totalAmount),
        id
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Treasures sold successfully",
      inventory: updateResult.rows[0]
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Sell treasures error:",
      error
    );

    res.status(500).json({
      message: "Failed to sell treasures",
      error: error.message
    });

  } finally {
    client.release();
  }
};


export const buyEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No equipment selected"
      });
    }

    // Get player inventory
    const inventoryResult = await db.query(
      `SELECT money, equipment
       FROM player_inventory
       WHERE id = $1`,
      [id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    const inventory = inventoryResult.rows[0];

    // Check money
    if (inventory.money < Number(totalAmount)) {
      return res.status(400).json({
        message: "Insufficient money"
      });
    }

    // Existing equipment array
    const equipmentInventory =
      inventory.equipment || [];

    // Add each purchased item_id
    for (const item of items) {

      const equipmentResult = await db.query(
        `SELECT item_id
         FROM equipment
         WHERE id = $1`,
        [item.equipmentId]
      );

      if (equipmentResult.rows.length === 0) {
        return res.status(404).json({
          message:
            "Equipment not found: " +
            item.equipmentId
        });
      }

      const itemId =
        String(equipmentResult.rows[0].item_id);

      const quantity =
        Number(item.quantity);

      for (let i = 0; i < quantity; i++) {
        equipmentInventory.push(itemId);
      }
    }

    // Deduct money
    const updatedMoney =
      inventory.money -
      Number(totalAmount);

    // Update inventory
    const updatedInventory = await db.query(
      `UPDATE player_inventory
       SET equipment = $1::jsonb,
           money = $2
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(equipmentInventory),
        updatedMoney,
        id
      ]
    );

    res.status(200).json({
      message: "Equipment purchased successfully",
      totalAmount: Number(totalAmount),
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

export const consumeLoadoutEquipment = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No equipment selected"
      });
    }

    await client.query("BEGIN");

    const inventoryResult = await client.query(
      `SELECT equipment
       FROM player_inventory
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (inventoryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Player inventory not found"
      });
    }

    const equipmentInventory =
      inventoryResult.rows[0].equipment || [];

    const equipmentIds =
      equipmentInventory.map(id => String(id));

    // Check and remove requested quantities
    for (const item of items) {
      const itemId = String(item.item_id);
      const quantity = Number(item.quantity);

      if (!itemId || quantity <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Invalid item_id or quantity"
        });
      }

      const currentQuantity =
        equipmentIds.filter(id => id === itemId).length;

      if (currentQuantity < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Not enough equipment for item_id ${itemId}`
        });
      }

      let removed = 0;

      for (let i = 0; i < equipmentIds.length; i++) {
        if (
          equipmentIds[i] === itemId &&
          removed < quantity
        ) {
          equipmentIds[i] = null;
          removed++;
        }
      }
    }

    const updatedEquipment =
      equipmentIds.filter(id => id !== null);

    const updatedInventory =
      await client.query(
        `UPDATE player_inventory
         SET equipment = $1::jsonb
         WHERE id = $2
         RETURNING *`,
        [
          JSON.stringify(updatedEquipment),
          id
        ]
      );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Loadout equipment consumed successfully",
      equipment: updatedEquipment,
      inventory: updatedInventory.rows[0]
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Consume loadout equipment error:",
      error
    );

    res.status(500).json({
      message: "Failed to consume loadout equipment",
      error: error.message
    });

  } finally {
    client.release();
  }
};