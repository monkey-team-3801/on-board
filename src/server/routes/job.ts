import express from "express";

import { asyncHandler, isClassOpenJob } from "../utils";
import { BaseJob } from "../../types";
import { ScheduleHandler } from "../jobs";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<{ message?: string }, {}, BaseJob>(async (req, res) => {
        const job = req.body;
        if (isClassOpenJob(job)) {
            const data = job.data;
            if (!data.roomName || data.roomName === "") {
                res.status(500)
                    .json({
                        message: "Room name should not be empty",
                    })
                    .end();
                return;
            }
            if (!data.courseCode || data.courseCode === "") {
                res.status(500)
                    .json({
                        message: "Course should not be empty",
                    })
                    .end();
                return;
            }
            if (
                new Date(data.endTime).getTime() <
                new Date(data.startTime).getTime()
            ) {
                res.status(500)
                    .json({
                        message: "Class should not end before it starts",
                    })
                    .end();
                return;
            }
        }
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
