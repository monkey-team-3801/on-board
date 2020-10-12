import express from "express";

import {
    asyncHandler,
    isClassOpenJob,
    isAnnouncementJob,
    classFormDataHasError,
} from "../utils";
import { BaseJob, SessionDeleteRequestType } from "../../types";
import { ScheduleHandler } from "../jobs";
import { getUserDataFromJWT } from "./utils";
import { Job } from "../database";

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
            const errorMessage = classFormDataHasError(job.data);
            if (errorMessage) {
                res.status(500)
                    .json({
                        message: errorMessage,
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
        console.log("adding", user.id);
        schedulerHandler.addNewJob({
            ...req.body,
            createdBy: user.id,
        });
        res.end();
    })
);

router.post(
    "/delete",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(
        async (req, res, next) => {
            console.log(req.body);
            console.log("Deleting job:", req.body.id);
            try {
                const job = await Job.findByIdAndDelete(req.body.id);
                if (job) {
                    const scheduleHandler = ScheduleHandler.getInstance();
                    scheduleHandler.removeQueuedJob(job._id);
                }
            } catch (e) {
                res.status(500);
            } finally {
                res.status(200).end();
            }
        }
    )
);
