import express from "express";

export const router = express.Router();

router.post("/submitMcForm", async (req, res) => {
    console.log(req.body);
});

router.post("/submitSaForm", async (req, res) => {
    console.log(req.body);
});
