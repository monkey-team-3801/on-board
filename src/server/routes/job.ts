import express from "express";

import { asyncHandler } from "../utils";
import { BaseJob } from "../../types";
import { ScheduleHandler } from "../jobs";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<{}, {}, BaseJob>(async (req, res) => {
        console.log("Job scheduled", new Date(req.body.jobDate).toISOString());
        console.log("Current time is", new Date().toISOString());
        console.log(
            "Executing in",
            new Date(req.body.jobDate).getTime() - new Date().getTime()
        );
        const schedulerHandler: ScheduleHandler = ScheduleHandler.getInstance();
        schedulerHandler.addNewJob({
            ...req.body,
        });
        res.end();
    })
);
