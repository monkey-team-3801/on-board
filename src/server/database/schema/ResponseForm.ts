import mongoose from "mongoose";
import { ResponseFormType } from "../../../types";

export interface IResponseForm extends mongoose.Document {
    sessionID: string;
    question: string;
    type: ResponseFormType;
    answered: Array<string>;
    owner: string;
}

export interface IMultipleChoiceResponseForm extends IResponseForm {
    options: Map<string, string>;
    count: Map<string, number>;
}

export interface IShortAnswerResponseForm extends IResponseForm {
    responseID: Array<string>;
}

const MultipleChoiceFormSchema = new mongoose.Schema<
    IMultipleChoiceResponseForm
>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
    options: { type: Map, default: new Map() },
    count: { type: Map, default: new Map() },
    answered: { type: Array, default: [] },
    owner: { type: String, required: true },
});

export const MultipleChoiceResponseForm = mongoose.model<
    IMultipleChoiceResponseForm
>("MultipleChoiceForm", MultipleChoiceFormSchema);

const ShortAnswerFormSchema = new mongoose.Schema<IMultipleChoiceResponseForm>({
    sessionID: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: ResponseFormType, required: true },
    answered: { type: Array, default: [] },
    owner: { type: String, required: true },
    responseID: { type: Array, default: [] },
});

export const ShortAnswerResponseForm = mongoose.model<IShortAnswerResponseForm>(
    "ShortAnswerForm",
    ShortAnswerFormSchema
);
