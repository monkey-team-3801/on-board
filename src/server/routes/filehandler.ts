import express from "express";
import { asyncHandler } from "../utils";

export const router = express.Router();

router.post(
    "/upload",
    asyncHandler<any, {}, Array<File>>(async (req, res) => {
        console.log(req.body);
    })
);
