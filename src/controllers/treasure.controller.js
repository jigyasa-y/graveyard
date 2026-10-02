import express from "express";
import db from "../config/db.js";

export const createTreasure = async (req, res) => {

    try {

        const { treasures } = req.body;

        if (!treasures || !Array.isArray(treasures)) {
            return res.status(400).json({
                message: "Treasures array is required"
            });
        }


        const insertedTreasures = [];


        for (const treasure of treasures) {

            const {
                name,
                description,
                rarity,
                value
            } = treasure;


            console.log(
                "Inserting:",
                name,
                description,
                rarity,
                value
            );


            const result = await db.query(
                `
                INSERT INTO treasure
                (name, description, rarity, value)
                VALUES ($1, $2, $3, $4)
                RETURNING *
                `,
                [
                    name,
                    description,
                    rarity,
                    value
                ]
            );


            insertedTreasures.push(
                result.rows[0]
            );
        }


        res.status(201).json({
            message: "Treasures inserted successfully",
            treasures: insertedTreasures
        });

    }
    catch (error) {

        console.log(
            "Error in create treasure:",
            error.message
        );

        res.status(500).json({
            message: "Error creating treasures",
            error: error.message
        });
    }
};







export const getTreasure = async(req,res)=>{

try{
  const result = await db.query("SELECT * FROM treasure");
  res.status(200).json(result.rows);
}
catch(error){
  res.status(500).json({message:"Error fetching treasures",error:error.message});


}
}
export const getTreasureById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get player's stored treasure item_ids
    const inventoryResult = await db.query(
      `SELECT treasure
       FROM player_inventory
       WHERE id = $1`,
      [id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Player inventory not found"
      });
    }

    const treasureArray =
      inventoryResult.rows[0].treasure || [];

    console.log("Player treasure array:", treasureArray);

    if (treasureArray.length === 0) {
      return res.status(200).json([]);
    }

    // Convert values to strings because treasure.item_id is VARCHAR
    const itemIds = treasureArray.map(itemId =>
      String(itemId)
    );

    // Count each item_id
    const quantityMap = {};

    for (const itemId of itemIds) {
      quantityMap[itemId] =
        (quantityMap[itemId] || 0) + 1;
    }

    console.log("Quantity map:", quantityMap);

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
      [itemIds]
    );

    // Add quantity to response
    const treasures = treasureResult.rows.map(
      treasure => ({
        ...treasure,
        quantity:
          quantityMap[String(treasure.item_id)] || 0
      })
    );

    console.log(
      "Player treasures:",
      treasures
    );

    res.status(200).json(treasures);

  } catch (error) {
    console.error(
      "Error fetching player treasures:",
      error
    );

    res.status(500).json({
      message: "Error fetching player treasures",
      error: error.message
    });
  }
};


export const updateTreasure = async(req,res)=>{

  try{
    const {id}=req.params;
    const {name, description, rarity, value}=req.body;
    const result= await  db.query("update treasure set name =$1, description=$2, rarity=$3, value=$4 where id=$5 returning *",[name, description, rarity, value, id]);
    res.status(200).json(result.rows[0]);
    


  }
  catch(error){
    res.status(500).json({message:"Error updating treasure",error:error.message});
  }



}

export const deleteTreasure = async(req,res)=>{

try{
  const {id}=req.params;
  const result= await db.query("delete from treasure where id=$1 returning *",[id]);
  if(result.rows.length===0){
    return res.status(404).json({message:"Treasure not found"});
  }
  res.status(200).json({message:"Treasure deleted successfully"});

}
catch(error){
  res.status(500).json({message:"Error deleting treasure",error:error.message});


}
}


