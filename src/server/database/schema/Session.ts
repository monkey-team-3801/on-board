import mongoose from "mongoose";
import { MessageData, FileStorageType } from "../../../types";

interface ISession extends mongoose.Document {
    name: string;
    messages?: Array<Omit<MessageData, "sessionId">>;
    files?: Map<string, FileStorageType>;
}

const SessionSchema = new mongoose.Schema<ISession>({
    name: { type: String, required: true },
    messages: { type: Array, default: [] },
    files: { type: Map, default: new Map() },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);
