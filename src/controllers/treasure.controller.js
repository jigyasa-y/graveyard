import express from "express";
import db from "../config/db.js";

export const  createTreasure = async(req,res)=>{

  try{
    const {name, description, rarity, value}=req.body;
    const result= await db.query("INSERT INTO treasure (name, description, rarity, value) VALUES ($1, $2, $3, $4) RETURNING *", [name, description, rarity, value]);
    res.status(201).json(result.rows[0]);



  }
  catch(error){

    res.status(500).json({message:"Error creating treasure",error:error.message});
  }





}

export const getTreasure = async(req,res)=>{

try{
  const result = await db.query("SELECT * FROM treasure");
  res.status(200).json(result.rows);



}
catch(error){
  res.status(500).json({message:"Error fetching treasures",error:error.message});


}
}

export const getTreasureById = async(req,res)=>{

  try{
    const {id}=req.params;
    const result= await db.query("select * from treasure where id=$1",[id]);
    if(result.rows.length===0){
      return res.status(404).json({message:"Treasure not found"});
    }
    res.status(200).json(result.rows[0]);

  }
  catch(error){
    res.status(500).json({message:"Error fetching treasure by id",error:error.message});
  }



}

export const updateTreasure = async(req,res)=>{

  try{
    const {id}=req.params;
    const {name, description, rarity, value}=req.body;
    const result= await  db.query("update treasure set name =$1, description=$2, rarity=$3, value=$4 where id=$5 returning *",[name, description, rarity, value, id]);
    if(result.rows.length===0){
      return res.status(404).json({message:"Treasure not found"});
    }


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


