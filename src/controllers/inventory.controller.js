import db from "../config/db.js";
import express from "express";

export const createInventory = async(req,res)=>{


try{


}
catch(error){
  res.status(500).json({message:"Error creating inventory",error:error.message});
}

}

export const getInventoryById = async(req,res)=>{

  try{


  }
  catch(error){
    res.status(500).json({message:"Error fetching inventory by id",error:error.message});
  }

}

export const updateInventory = async(req,res)=>{

try{


}
catch(error){
  res.status(500).json({message:"Error updating inventory",error:error.message});
}

}

export const deleteInventory = async(req,res)=>{

  try{

  }
catch(error){
  res.status(500).json({message:"Error deleting inventory",error:error.message});
}
}