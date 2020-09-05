import schedule from "node-schedule";
import { ObjectId } from "mongodb";

import { Job, IJob } from "../database/schema";
import { BaseJob } from "../../types";
import { jobRunner } from "./job-runner";

/**
 * Basic handler for job scheduling.
 */
export class ScheduleHandler<T = any> {
    private static instance: ScheduleHandler;
    private jobMap: Map<string, schedule.Job>;

    public constructor() {
        this.jobMap = new Map();
        ScheduleHandler.instance = this;
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
                console.log("Job queued", job.jobDate);
                this.queueNewJob(job);
            }
        });
    }

    /**
     * Queues a job for execution at a future date.
     * @param job Future job.
     */
    private async queueNewJob(job: IJob): Promise<void> {
        const currentDate: Date = new Date();
        this.jobMap.set(
            job._id.toHexString(),
            schedule.scheduleJob(
                currentDate.getTime() +
                    Math.max(
                        new Date(job.jobDate).getTime() - currentDate.getTime(),
                        0
                    ),
                () => {
                    // TODO job execution goes here.
                    jobRunner(job);
                    this.removeQueuedJob(job._id);
                }
            )
        );
    }

    /**
     * Adds a new job to the database for execution at a future date. The job is automatically queued.
     * @param job Future job.
     */
    public async addNewJob(job: BaseJob<T>): Promise<void> {
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

    /**
     * Returns a singleton of this class if it exists, otherwise return a new instance.
     */
    public static getInstance<T>(): ScheduleHandler<T> {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ScheduleHandler<T>();
        return this.instance;
    }
}
