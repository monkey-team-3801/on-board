import mongoose from "mongoose";
import { MessageData } from "../../../types";

interface IUserToUserChat extends mongoose.Document {
    betweenUsers: [string, string];
    usersToHasNewMessageMap: Map<string, boolean>;
    messages: Array<Omit<MessageData, "sessionId">>;
}

const UserToUserChatSchema = new mongoose.Schema<IUserToUserChat>({
    usersToHasNewMessageMap: { type: Map, required: true },
    betweenUsers: { type: Array, required: true },
    messages: { type: Array, default: [] },
});

export const UserToUserChat = mongoose.model<IUserToUserChat>(
    "UserToUserChat",
    UserToUserChatSchema
);
