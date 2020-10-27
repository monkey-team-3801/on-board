import { AnnouncementEvent, ClassEvent } from "../../events";
import { AnnouncementJob, BaseJob, ClassOpenJob } from "../../types";
import { Course } from "../database";
import { ClassroomSession, User } from "../database/schema";
import { io } from "../server";
import { isAnnouncementJob, isClassOpenJob } from "../utils";

/**
 * Executes the announcement job when the specified time is reached.
 * @param job Announcement job data.
 */
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

/**
 * Executes the class open job when the specified time is reached.
 * @param job Class open job data. 
 */
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

/**
 * Simple switcher depending on the job being ran.
 * @param job Base job being executed.
 */
export const jobRunner = (job: BaseJob): void => {
    if (isAnnouncementJob(job)) {
        runAnnouncementJob(job);
    } else if (isClassOpenJob(job)) {
        runClassOpenJob(job);
    }
};
