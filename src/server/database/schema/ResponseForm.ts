import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export interface IResponseForm extends mongoose.Document {
    _id: ObjectId;
    question: string;
    options?: Map<string, string>;
}

const ResponseFormSchema = new mongoose.Schema<IResponseForm>({
    question: { type: String, required: true },
    options: { type: Map, default: new Map() },
});
