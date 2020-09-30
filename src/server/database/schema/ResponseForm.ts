import mongoose from "mongoose";

export interface IResponseForm extends mongoose.Document {
    id: string;
    question: string;
    options?: Map<string, string>;
}

const ResponseFormSchema = new mongoose.Schema<IResponseForm>({
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: Map, default: new Map() },
});
