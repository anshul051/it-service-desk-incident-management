import express from "express";
import dotenv from "dotenv";
import db from "./src/config/database.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Han Bhai Main Theek Hun!!",
        status: "success",
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});