import React from "react";
import { useDropzone } from "react-dropzone";
import "../styles/UploadContainer.less";

export const UploadContainer = () => {
    const onDrop = React.useCallback((acceptedFiles) => {
        console.log(acceptedFiles);
    }, []);
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
