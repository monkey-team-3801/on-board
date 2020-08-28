import schedule from "node-schedule";
import { ObjectId } from "mongodb";

import { Job, IJob } from "../database/schema";
import { BaseJob } from "../types";

/**
 * Basic handler for job scheduling.
 */
export class ScheduleHandler {
    private jobMap: Map<string, schedule.Job>;

    public constructor() {
        this.jobMap = new Map();
    }

    /**
     * Queue existing jobs in the database. The job is cancelled if the job time is older than current time.
     */
    public async queueExistingJobs(): Promise<void> {
        (await Job.find()).forEach((job: IJob) => {
            if (new Date(job.jobDate).getTime() < new Date().getTime()) {
                // Discard old jobs.
                this.removeJobReference(job._id);
            } else {
                // Queue new jobs for exexution.
                this.queueNewJob(job);
            }
        });
    }

    /**
     * Queues a job for execution at a future date.
     * @param job Future job.
     */
    private async queueNewJob(job: IJob): Promise<void> {
        this.jobMap.set(
            job._id.toHexString(),
            schedule.scheduleJob(new Date(job.jobDate), () => {
                // TODO job execution goes here.
                this.removeQueuedJob(job._id);
            })
        );
    }

    /**
     * Adds a new job to the database for execution at a future date. The job is automatically queued.
     * @param job Future job.
     */
    public async addNewJob(job: BaseJob): Promise<void> {
        try {
            const jobReference: IJob = await Job.create({
                jobDate: job.jobDate,
                executingEvent: job.executingEvent,
                data: job.data,
            });
            this.queueNewJob(jobReference);
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Removes a queued job.
     * @param id ID of job to remove.
     */
    public async removeQueuedJob(id: ObjectId): Promise<void> {
        this.jobMap.delete(id.toHexString());
        await this.removeJobReference(id);
    }

    /**
     * Removes a job reference stored in the database.
     * @param id ID of job to remove.
     */
    private async removeJobReference(id: ObjectId): Promise<void> {
        await Job.deleteOne({ _id: id });
    }
}
