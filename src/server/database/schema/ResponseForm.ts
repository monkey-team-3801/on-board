import mongoose from "mongoose";

export interface IResponseForm extends mongoose.Document {
    sessionID: string;
    question: string;
    options: Map<string, string>;
    count: Array<number>;
}

const ResponseFormSchema = new mongoose.Schema<IResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: Map, default: new Map() },
    count: { type: Array, default: [] },
});

export const ResponseForm = mongoose.model<IResponseForm>(
    "ResponseForm",
    ResponseFormSchema
);
