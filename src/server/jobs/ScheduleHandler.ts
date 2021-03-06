import schedule from "node-schedule";
import { BaseJob } from "../../types";
import { IJob, Job } from "../database/schema";
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
                this.removeJobReference(job.jobId);
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
            job.jobId,
            schedule.scheduleJob(new Date(job.jobDate), () => {
                jobRunner(job);
                this.removeQueuedJob(job.jobId);
            })
        );
    }

    /**
     * Adds a new job to the database for execution at a future date. The job is automatically queued.
     * @param job Future job.
     */
    public async addNewJob(job: BaseJob<T>): Promise<void> {
        try {
            const currentDate: Date = new Date();
            const jobDate: Date = new Date(job.jobDate);
            if (jobDate.getTime() <= currentDate.getTime()) {
                const modifiedJobData = {
                    ...job,
                    jobDate: new Date().toISOString(),
                };
                jobRunner(modifiedJobData);
            } else {
                const jobReference: IJob = await Job.create({
                    ...job,
                });
                this.queueNewJob(jobReference);
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Removes a queued job.
     * @param id ID of job to remove.
     */
    public async removeQueuedJob(id: string): Promise<void> {
        this.jobMap.delete(id);
        await this.removeJobReference(id);
    }

    /**
     * Removes a job reference stored in the database.
     * @param id ID of job to remove.
     */
    private async removeJobReference(id: string): Promise<void> {
        await Job.deleteOne({ jobId: id });
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
