import mongoose from "mongoose";

interface IUser extends mongoose.Document {
    username: string;
    password: string;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, trim: true, required: true },
    password: { type: String, required: true },
});

export const User = mongoose.model<IUser>("User", UserSchema);
