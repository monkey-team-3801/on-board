import mongoose from "mongoose";

interface IVideoSession extends mongoose.Document {
    sessionId: string;
    userPeerMap: Map<string, string>;
    userReferenceMap: Map<string, number>;
}

const VideoSessionSchema = new mongoose.Schema<IVideoSession>({
    sessionId: { type: String, required: true, unique: true },
    userPeerMap: { type: Map, default: new Map() },
    userReferenceMap: { type: Map, default: new Map() },
});

export const VideoSession = mongoose.model<IVideoSession>(
    "VideoSession",
    VideoSessionSchema
);
