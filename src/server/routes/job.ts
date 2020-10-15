import express from "express";

import {
    asyncHandler,
    isClassOpenJob,
    isAnnouncementJob,
    classFormDataHasError,
    createNewClassroomSession,
    isCreateClassroomRequestType,
    isCreateAnnouncementRequestType,
} from "../utils";
import {
    BaseJob,
    SessionDeleteRequestType,
    CreateClassroomJobRequestType,
    AnyJobRequestType,
    ClassOpenJob,
    AnnouncementJob,
} from "../../types";
import { ScheduleHandler } from "../jobs";
import { getUserDataFromJWT } from "./utils";
import { Job, ClassroomSession } from "../database";
import { ExecutingEvent } from "../../events";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<{ message?: string }, {}, AnyJobRequestType>(
        async (req, res) => {
            const job = req.body;
            const user = req.headers.authorization
                ? await getUserDataFromJWT(req.headers.authorization)
                : null;
            if (!user) {
                res.status(401).end();
                return;
            }
            const schedulerHandler: ScheduleHandler = ScheduleHandler.getInstance();
            if (isCreateClassroomRequestType(job)) {
                const errorMessage = classFormDataHasError(job);
                if (errorMessage) {
                    res.status(500)
                        .json({
                            message: errorMessage,
                        })
                        .end();
                    return;
                } else {
                    const session = await createNewClassroomSession(
                        job,
                        user._id.toHexString()
                    );
                    await schedulerHandler.addNewJob({
                        jobId: session._id,
                        executingEvent: ExecutingEvent.CLASS_OPEN,
                        jobDate: job.startTime,
                        data: {
                            id: session.id,
                        },
                    });
                }
            }
            if (isCreateAnnouncementRequestType(job)) {
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
                schedulerHandler.addNewJob({
                    ...job,
                    executingEvent: ExecutingEvent.ANNOUNCEMENT,
                    data: {
                        ...job.data,
                        userId: user._id,
                    },
                });
            }
            // console.log(
            //     "Job scheduled",
            //     new Date(req.body.jobDate).toISOString()
            // );
            // console.log("Current time is", new Date().toISOString());
            // console.log(
            //     "Executing in",
            //     new Date(req.body.jobDate).getTime() - new Date().getTime()
            // );
            // const schedulerHandler: ScheduleHandler = ScheduleHandler.getInstance();
            // console.log("adding", user.id);
            res.status(200).end();
        }
    )
);

router.post(
    "/delete",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(
        async (req, res, next) => {
            console.log(req.body);
            console.log("Deleting job:", req.body.id);
            try {
                await ClassroomSession.findByIdAndDelete(req.body.id);
                const job = await Job.findByIdAndDelete(req.body.id);
                if (job) {
                    const scheduleHandler = ScheduleHandler.getInstance();
                    scheduleHandler.removeQueuedJob(job.jobId);
                }
            } catch (e) {
                res.status(500);
            } finally {
                res.status(200).end();
            }
        }
    )
);
