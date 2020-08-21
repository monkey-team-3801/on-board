import express from "express";
import bodyParser from "body-parser";

export const router = express.Router();

router.get("/register", (req, res) => {
    let username: string = req.body.username;
    let password: string = req.body.password;
    //TODO
});
