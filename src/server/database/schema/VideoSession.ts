import mongoose from "mongoose";

interface IVideoSession extends mongoose.Document {
    sessionId: string;
    peers: Array<string>;
}

const VideoSessionSchema = new mongoose.Schema<IVideoSession>({
    sessionId: { type: String, required: true, unique: true },
    peers: { type: Array, default: [] },
});

export const VideoSession = mongoose.model<IVideoSession>(
    "VideoSession",
    VideoSessionSchema
);
