import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import config from "./config.js";
import mongoose from "mongoose";
import cors from 'cors'
import nodemailer from 'nodemailer'
import paymentRoute from './routes/paymentRoute.js'
import orderRoute from "./routes/orderRoute.js"
import userRoute from "./routes/usersRoute.js";
import authes from "./routes/authes.js";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongodburl = config.MONGODB_URL;
mongoose
  .connect(mongodburl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

const app = express();

const router = express.Router();

app.use(cors());
app.use(express.json());
app.use("/", router);

const contactEmail = nodemailer.createTransport({
  name: "www.recoreltdng.com",
  host: "mail.recoreltdng.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@recoreltdng.com",
    pass: "@Recore2024",
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

app.use(bodyParser.json());
app.use("/api/payment", paymentRoute)
app.use("/api/orders", orderRoute);
app.use("/api/users", userRoute);
app.use("/api/authes", authes);

app.use(express.static(path.join(__dirname, "/../frontend/dist")));

app.use("/uploads", express.static(path.join(__dirname, "/../uploads")));
app.get("*", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/dist/index.html`));
});
console.log("Looking for:", path.join(__dirname, '/../frontend/dist/index.html'));


app.use("/uploads2", express.static(path.join(__dirname, "/../uploads")));

app.listen(config.PORT, () => {
  console.log(`Your success is here, Time for you to be elevated. ${config.PORT}`);
});
