import mongoose from "mongoose";

interface ISessionUsers extends mongoose.Document {
    sessionId: string;
    userReferenceMap: Map<string, number>;
}

const SessionUsersSchema = new mongoose.Schema<ISessionUsers>({
    sessionId: { type: String, required: true, unique: true },
    userReferenceMap: { type: Map, default: new Map() },
});

export const SessionUsers = mongoose.model<ISessionUsers>(
    "SessionUsers",
    SessionUsersSchema
);
