import { io } from "../server";
import { BaseJob, AnnouncementJob, ClassOpenJob } from "../../types";
import {
    isAnnouncementJob,
    isClassOpenJob,
    createNewClassroomSession,
} from "../utils";
import { Course } from "../database";
import { User } from "../database/schema";
import { AnnouncementEvent, ClassEvent } from "../../events";

const runAnnouncementJob = async (job: AnnouncementJob): Promise<void> => {
    console.log("Running job", job.jobDate, job.createdBy);
    const user = await User.findById(job.createdBy);
    const course = await Course.findOne({ code: job.data.courseCode });
    if (user) {
        course?.announcements?.push({
            ...job.data,
            userId: user.id,
            username: user.username,
            date: job.jobDate,
        });
    }
    await course?.save();
    io.in(`${job.data.courseCode}_ANNOUNCEMENT`).emit(AnnouncementEvent.NEW);
};

const runClassOpenJob = async (job: ClassOpenJob): Promise<void> => {
    console.log("Running class job", job);
    const session = await createNewClassroomSession(job);
    io.in(`${job.data.courseCode}_ANNOUNCEMENT`).emit(ClassEvent.OPEN, {
        id: session._id,
        course: job.data.courseCode,
        roomName: job.data.name,
    });
};

export const jobRunner = (job: BaseJob): void => {
    if (isAnnouncementJob(job)) {
        runAnnouncementJob(job);
    } else if (isClassOpenJob(job)) {
        runClassOpenJob(job);
    }
};
