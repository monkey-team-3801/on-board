import mongoose from "mongoose";
import { ResponseFormType } from "../../../types";

export interface IResponseForm extends mongoose.Document {
    sessionID: string;
    question: string;
    options?: Map<string, string>;
    count?: Array<number>;
    type: ResponseFormType;
    answered: Array<string>;
    owner: string;
}

const MultipleChoiceFormSchema = new mongoose.Schema<IResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
    options: { type: Map, default: new Map() },
    count: { type: Array, default: [] },
    answered: { type: Array, default: [] },
    owner: { type: String, required: true },
});

export const MultipleChoiceResponseForm = mongoose.model<IResponseForm>(
    "MultipleChoiceForm",
    MultipleChoiceFormSchema
);

const ShortAnswerFormSchema = new mongoose.Schema<IResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
    answered: { type: Array, default: [] },
    owner: { type: String, required: true },
});

export const ShortAnswerResponseForm = mongoose.model<IResponseForm>(
    "ShortAnswerForm",
    ShortAnswerFormSchema
);
