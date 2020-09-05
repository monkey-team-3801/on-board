import express from "express";

import { asyncHandler } from "../utils";
import {
    BaseJob,
} from "../../types";
import { ScheduleHandler } from "../jobs";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<{}, {}, BaseJob>(async (req, res) => {
        const schedulerHandler: ScheduleHandler = ScheduleHandler.getInstance();
        schedulerHandler.addNewJob({
            ...req.body
        });
        res.end();
    })
);
