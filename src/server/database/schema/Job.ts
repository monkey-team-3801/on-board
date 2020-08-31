import mongoose, { Schema } from "mongoose";
import { BaseJob, ExecutingEvent } from "../../types";
import { ObjectId } from "mongodb";

export interface IJob extends mongoose.Document, BaseJob {
    _id: ObjectId;
}

const JobSchema = new mongoose.Schema<IJob>({
    jobDate: { type: String, required: true },
    executingEvent: { type: ExecutingEvent, required: true },
    data: { type: Schema.Types.Mixed, required: true },
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
