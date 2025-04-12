import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt, { decode } from 'jsonwebtoken';

const app = express();

const router = express.Router();
// const cors = require("cors");
import cors from 'cors'
import nodemailer from 'nodemailer'
// const nodemailer = require("nodemailer");


router.post("/", (req, res) => {


    let token = req.headers.authorization;
    //console.log("Check Start...")
    let decodedToken = decode(token);
    //console.log(token)
    //console.log("Decoded Token", decodedToken);
    let currentDate = new Date();
  
    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      res.send(false);
      //console.log("Token expired.");
      return false;
    } else {
      res.send(true);
      //console.log("Valid token");
      return true;
    }
  
    // if(token){
    //   res.json(true);
    // }else{
    //   res.json(false);
    // }
  
  })


  export default router;