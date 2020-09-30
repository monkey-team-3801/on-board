import mongoose from "mongoose";
import { ResponseFormType } from "../../../types";

export interface IResponseForm extends mongoose.Document {
    sessionID: string;
    question: string;
    options?: Map<string, string>;
    count?: Array<number>;
    type: ResponseFormType;
}

const MultipleChoiceFormSchema = new mongoose.Schema<IResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
    options: { type: Map, default: new Map() },
    count: { type: Array, default: [] },
});

export const MultipleChoiceResponseForm = mongoose.model<IResponseForm>(
    "MultipleChoiceForm",
    MultipleChoiceFormSchema
);

const ShortAnswerFormSchema = new mongoose.Schema<IResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
});

export const ShortAnswerResponseForm = mongoose.model<IResponseForm>(
    "ShortAnswerForm",
    ShortAnswerFormSchema
);
