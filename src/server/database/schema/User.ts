import mongoose from "mongoose";
import { UserType } from "../../../types";

interface IUser extends mongoose.Document {
    username: string;
    password: string;
    userType: UserType;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: UserType, required: true },
});

export const User = mongoose.model<IUser>("User", UserSchema);