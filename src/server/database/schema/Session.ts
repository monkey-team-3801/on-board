import mongoose from "mongoose";
import { MessageData, RoomType } from "../../../types";

interface ISession extends mongoose.Document {
    name: string;
    messages: Array<Omit<MessageData, "sessionId">>;
    description: string;
    roomType: RoomType;
    courseCode?: string;
}

// interface PrivateRoom extends ISession {
//     roomType: RoomType.PRIVATE;
// }

interface IClassroomSession extends ISession {
    roomType: RoomType.CLASS;
    courseCode: string;
    startTime: string;
    endTime: string;
}

const SessionSchema = new mongoose.Schema<ISession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    roomType: { type: Number },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);

const ClassroomSessionSchema = new mongoose.Schema<IClassroomSession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    roomType: { type: Number },
    description: { type: String },
    courseCode: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

export const ClassroomSession = mongoose.model<IClassroomSession>(
    "ClassroomSession",
    ClassroomSessionSchema
);
