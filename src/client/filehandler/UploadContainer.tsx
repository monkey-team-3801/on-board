import React from "react";
import { useDropzone } from "react-dropzone";
import "../styles/UploadContainer.less";
import { useDynamicFetch } from "../hooks";

export const UploadContainer = () => {
    const [data, uploadFile] = useDynamicFetch<any, Array<File>>(
        "filehandler/upload",
        undefined,
        false
    );

    const onDrop = async (acceptedFiles: Array<File>) => {
        console.log(acceptedFiles);
        await uploadFile(acceptedFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div {...getRootProps()} className="container">
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="message">Drop the files here ...</p>
            ) : (
                <p className="message">
                    Drag 'n' drop some files here, or click to select files
                </p>
            )}
        </div>
    );
};
