import mongoose from "mongoose";
import { MessageData, RoomType } from "../../../types";

interface ISession extends mongoose.Document {
    name: string;
    messages: Array<Omit<MessageData, "sessionId">>;
    description: string;
    roomType: RoomType;
    courseCode?: string;
    files?: Array<string>;
}
interface IClassroomSession extends ISession {
    roomType: RoomType.CLASS;
    courseCode: string;
    startTime: string;
    endTime: string;
    raisedHandUsers: Array<string>;
}

interface IBreakoutSession extends ISession {
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
    roomType: { type: Number },
    description: { type: String },
    courseCode: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    raisedHandUsers: { type: Array, default: [] },
    files: { type: Array, default: [] },
});

const BreakoutSessionSchema = new mongoose.Schema<IBreakoutSession>({
    _id: { type: String, required: true },
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
