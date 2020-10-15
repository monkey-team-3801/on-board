import mongoose, { Schema } from "mongoose";
import { BaseJob } from "../../../types";
import { ExecutingEvent } from "../../../events";
import { ObjectId } from "mongodb";

export interface IJob extends mongoose.Document, BaseJob {}

const JobSchema = new mongoose.Schema<IJob>({
    jobId: { unique: true, type: String, required: true },
    jobDate: { type: String, required: true },
    executingEvent: { type: ExecutingEvent, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: String },
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
