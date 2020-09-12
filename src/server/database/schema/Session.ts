import mongoose from "mongoose";
import { MessageData } from "../../../types";

interface ISession extends mongoose.Document {
    name: string;
    messages?: Array<Omit<MessageData, "sessionId">>;
    files?: Array<Buffer>;
}

const SessionSchema = new mongoose.Schema<ISession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    files: { type: Array, default: [] },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);
