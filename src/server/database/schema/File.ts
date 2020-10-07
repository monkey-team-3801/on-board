import mongoose from "mongoose";

export interface IFile extends mongoose.Document {
    name: string;
    size: number;
    data: Buffer;
    extension: string;
    owner: string;
    sessionID: string;
    fileTime: string;
}

export interface IFileResponse extends IFile {
    formID: string;
}

const FileSchema = new mongoose.Schema<IFile>({
    name: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    extension: { type: String, required: true },
    owner: { type: String, required: true },
    sessionID: { type: String, required: true },
    fileTime: { type: String, required: true },
});

export const File = mongoose.model<IFile>("File", FileSchema);

const FileResponseSchema = new mongoose.Schema<IFileResponse>({
    name: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    extension: { type: String, required: true },
    owner: { type: String, required: true },
    sessionID: { type: String, required: true },
    fileTime: { type: String, required: true },
    formID: { type: String, required: true },
});

export const FileResponse = mongoose.model<IFileResponse>(
    "FileResponse",
    FileResponseSchema
);
