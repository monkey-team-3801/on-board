import express from "express";

export const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200);
});
