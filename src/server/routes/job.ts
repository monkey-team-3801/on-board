import express from "express";

import { asyncHandler, isClassOpenJob, isAnnouncementJob } from "../utils";
import { BaseJob } from "../../types";
import { ScheduleHandler } from "../jobs";
import { getUserDataFromJWT } from "./utils";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<{ message?: string }, {}, BaseJob>(async (req, res) => {
        const job = req.body;
        const user = req.headers.authorization
            ? await getUserDataFromJWT(req.headers.authorization)
            : null;
        if (!user) {
            res.status(401).end();
            return;
        }
        if (isClassOpenJob(job)) {
            const data = job.data;
            if (!data.name) {
                res.status(500)
                    .json({
                        message: "Room name should not be empty",
                    })
                    .end();
                return;
            }
            if (!data.courseCode) {
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
        if (isAnnouncementJob(job)) {
            const data = job.data;
            if (!data.title) {
                res.status(500)
                    .json({
                        message: "Title should not be empty",
                    })
                    .end();
                return;
            }
            if (!data.courseCode) {
                res.status(500)
                    .json({
                        message: "Course should not be empty",
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
            createdBy: user.id,
        });
        res.end();
    })
);
