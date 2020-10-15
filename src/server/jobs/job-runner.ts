import { io } from "../server";
import { BaseJob, AnnouncementJob, ClassOpenJob } from "../../types";
import {
    isAnnouncementJob,
    isClassOpenJob,
    createNewClassroomSession,
} from "../utils";
import { Course } from "../database";
import { User, ClassroomSession } from "../database/schema";
import { AnnouncementEvent, ClassEvent } from "../../events";

const runAnnouncementJob = async (job: AnnouncementJob): Promise<void> => {
    console.log("Running announcement job", job);
    const user = await User.findById(job.data.userId);
    const course = await Course.findOne({ code: job.data.courseCode });
    if (user && course) {
        course.announcements.push({
            ...job.data,
            userId: user.id,
            username: user.username,
            date: job.jobDate,
        });
        await course.save();
        io.in(`${job.data.courseCode}_ANNOUNCEMENT`).emit(
            AnnouncementEvent.NEW
        );
    }
};

const runClassOpenJob = async (job: ClassOpenJob): Promise<void> => {
    console.log("Running class job", job);
    const session = await ClassroomSession.findByIdAndUpdate(job.data.id, {
        open: true,
    });
    if (session) {
        io.in(`${session.courseCode}_ANNOUNCEMENT`).emit(ClassEvent.OPEN, {
            id: session._id,
            course: session.courseCode,
            roomName: session.name,
        });
    }
};

export const jobRunner = (job: BaseJob): void => {
    if (isAnnouncementJob(job)) {
        runAnnouncementJob(job);
    } else if (isClassOpenJob(job)) {
        runClassOpenJob(job);
    }
};
