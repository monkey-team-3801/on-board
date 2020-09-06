import { io } from "../server";
import { BaseJob, AnnouncementJob } from "../../types";
import { isAnnouncementJob } from "../utils";
import { Course } from "../database";
import { User } from "../database/schema";
import { AnnouncementEvent } from "../../events";

const runAnnouncementJob = async (job: AnnouncementJob): Promise<void> => {
    const user = await User.findById(job.data.user);
    const course = await Course.findOne({ code: job.data.courseCode });
    if (user) {
        course?.announcements?.push({
            ...job.data,
            user: user.username,
            date: job.jobDate,
        });
    }
    await course?.save();
    io.in(`${job.data.courseCode}_ANNOUNCEMENT`).emit(AnnouncementEvent.NEW);
};

export const jobRunner = (job: BaseJob): void => {
    if (isAnnouncementJob(job)) {
        runAnnouncementJob(job);
    }
};
