import db from "../config/db.js";
import express from "express";

export const createEquipments = async (req, res) => {
  try {
    const equipments = Array.isArray(req.body)
      ? req.body
      : [req.body];

    if (equipments.length === 0) {
      return res.status(400).json({
        message: "At least one equipment is required"
      });
    }

    const createdEquipments = [];

    for (const equipment of equipments) {
      const {
        name,
        description,
        buy_price,
        sell_price
      } = equipment;
      
      if (!name || !description || !buy_price ||!sell_price === undefined) {
        return res.status(400).json({
          message: "name, description and price are required"
        });
      }

      const result = await db.query(
        `INSERT INTO equipment
        (name, description,buy_price,sell_price)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          name,
          description || null,
          buy_price,
          sell_price
        
        
        ]
      );

      createdEquipments.push(result.rows[0]);
    }

    res.status(201).json({
      message: "Equipment(s) created successfully",
      equipments: createdEquipments
    });

  } catch (error) {
    console.error("Create equipment error:", error);

    res.status(500).json({
      message: "Error creating equipment",
      error: error.message
    });
  }
};

export const getEquipments = async(req,res)=>{

  try{
    const result = await db.query("SELECT * FROM equipment");
    res.status(200).json(result.rows);

  }
  catch(error){
    res.status(500).json({message:"Error fetching equipment",error:error.message});
  }
}

export const getEquipmentsById = async(req,res)=>{

  try{
    const {id} =req.params;
    const result = await db.query("SELECT * FROM equipment WHERE id=$1", [id]);
    if(result.rows.length === 0){
      return res.status(404).json({message:"Equipment not found"});
    }
    res.status(200).json(result.rows[0]);

  }
  catch(error){
    res.status(500).json({message:"Error fetching equipment by id",error:error.message});
  }

}

export const updateEquipments = async(req,res)=>{


try{
  const {id} =req.params;
  const {name, description, price} =req.body;

  const result = await db.query("UPDATE equipment SET name=$1, description=$2, price=$3 WHERE id=$4 RETURNING *", [name, description, price, id]);
  res.status(200).json(result.rows[0]);



}
catch(error){
  res.status(500).json({message:"Error updating equipment",error:error.message});
}
}

export const deleteEquipments = async(req,res)=>{

  try{
    const {id}=req.params;
    const result = await db.query("DELETE FROM equipment WHERE id=$1 RETURNING *", [id]);
    if(result.rows.length === 0){
      return res.status(404).json({message:"Equipment not found"});
    }


  }
  catch(error){
    res.status(500).json({message:"Error deleting equipment",error:error.message});
  }
}

  