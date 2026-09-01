import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/", (req, res)=> {
    res.send({ 
        "message": "Han Bhai Main Theek Hun!!",
        "status": "success",
        "UpTime": process.uptime()
     });
});