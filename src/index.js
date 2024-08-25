// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connectDB()


// IIFE is immideatley invoked function expression
/*
import express from "express"
const app=express()
(async () => {
    try{
        await mongoose.connect(`${process.env.MONGOBD_URI}/${
            DB.NAME}')}`)
        app.on("error", (ERROR)=>{
            console.log("ERROR: ",error);
            throw error
    })
     app.listen(process.env.PORT, ()=>{
            console.log(`App is litening
             ${process.env.PORT}`);
            
     })   
    }catch(error){
        console.log("ERROR: ",error);
        throw error
        
    }
})()
    */

