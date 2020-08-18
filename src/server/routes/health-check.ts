import express from "express";
import { asyncHandler } from "../utils";

export const router = express.Router();

router.get(
    "/",
    asyncHandler<string>((req, res) => {
        res.status(200).send("ok");
    })
);
