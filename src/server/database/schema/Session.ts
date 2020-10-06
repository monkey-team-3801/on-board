import mongoose from "mongoose";
import { MessageData } from "../../../types";

export interface ISession extends mongoose.Document {
    name: string;
    messages: Array<Omit<MessageData, "sessionId">>;
    description: string;
    courseCode?: string;
    files?: Array<string>;
}
interface IClassroomSession extends ISession {
    courseCode: string;
    startTime: string;
    endTime: string;
    raisedHandUsers: Array<string>;
    roomType: string;
    colourCode: string;
}

interface IBreakoutSession extends ISession {
    id: string;
    parentSessionId: string;
}
const SessionSchema = new mongoose.Schema<ISession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    files: { type: Array, default: [] },
    roomType: { type: Number },
    courseCode: { type: String },
});

const ClassroomSessionSchema = new mongoose.Schema<IClassroomSession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    roomType: { type: String },
    description: { type: String },
    courseCode: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    raisedHandUsers: { type: Array, default: [] },
    files: { type: Array, default: [] },
    colourCode: { type: String },
});

const BreakoutSessionSchema = new mongoose.Schema<IBreakoutSession>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    files: { type: Map, default: [] },
    roomType: { type: Number },
    courseCode: { type: String },
    parentSessionId: { type: String, required: true },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);

export const ClassroomSession = mongoose.model<IClassroomSession>(
    "ClassroomSession",
    ClassroomSessionSchema
);

export const BreakoutSession = mongoose.model<IBreakoutSession>(
    "BreakoutSession",
    BreakoutSessionSchema
);
