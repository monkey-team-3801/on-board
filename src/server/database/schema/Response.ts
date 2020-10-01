import mongoose from "mongoose";

export interface IResponse extends mongoose.Document {
    userID: string;
    formID: string;
    userResponse: string;
}

const ResponseSchema = new mongoose.Schema<IResponse>({
    userID: { type: String, required: true },
    formID: { type: String, required: true },
    userResponse: { type: String, required: true },
});

export const Response = mongoose.model<IResponse>("Response", ResponseSchema);
