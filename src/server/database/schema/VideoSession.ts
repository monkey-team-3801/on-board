import mongoose from "mongoose";

interface IVideoSession extends mongoose.Document {
    sessionId: string;
    userPeerMap: Map<string, string>;
    userReferenceMap: Map<string, number>;
    numScreensAllowed: number;
    sharingUsers: Array<string>;
}

const VideoSessionSchema = new mongoose.Schema<IVideoSession>({
    sessionId: { type: String, required: true, unique: true },
    userPeerMap: { type: Map, default: new Map() },
    userReferenceMap: { type: Map, default: new Map() },
    numScreensAllowed: { type: Number, default: 1 },
    sharingUsers: { type: Array, default: [] },
});

export const VideoSession = mongoose.model<IVideoSession>(
    "VideoSession",
    VideoSessionSchema
);
