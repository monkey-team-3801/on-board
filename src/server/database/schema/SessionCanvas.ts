import mongoose from "mongoose";
import { Stroke } from "../../../types";

export interface ISessionCanvas extends mongoose.Document {
    sessionId: string;
    strokes: Array<Stroke>;
}

const SessionCanvasSchema = new mongoose.Schema<ISessionCanvas>({
    sessionId: { type: String, required: true, unique: true },
    strokes: { type: Array, default: [] },
});

export const SessionCanvas = mongoose.model<ISessionCanvas>(
    "SessionCanvas",
    SessionCanvasSchema
);
