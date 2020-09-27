import express from "express";

export const router = express.Router();

router.post("/submitForm", async (req, res) => {
    console.log("test");
});
