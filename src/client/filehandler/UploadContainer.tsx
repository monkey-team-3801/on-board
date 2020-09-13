import React from "react";
import { useDropzone } from "react-dropzone";
import "../styles/UploadContainer.less";
import { useDynamicFetch } from "../hooks";
import { FileUploadType } from "../../types";

// To differentiate between documents and profile pictures.
type Props = {
    uploadType: FileUploadType;
    sessionID?: string;
};

export const UploadContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [, uploadPfp] = useDynamicFetch<undefined, FormData>(
        "/filehandler/pfpUpload",
        undefined,
        false
    );

    const [, uploadFile] = useDynamicFetch<undefined, FormData>(
        "/filehandler/uploadFiles",
        undefined,
        false
    );

    // Values are in bytes
    function maxFileSize(): number {
        if (props.uploadType === FileUploadType.DOCUMENTS) {
            return 10000000;
        } else {
            return 1000000;
        }
    }

    // Max file size.
    const mfs = maxFileSize();

    // Check files are of appropriate length.
    function checkValid(files: Array<File>): boolean {
        if (props.uploadType === FileUploadType.PROFILE) {
            return files.length === 1;
        }
        // Limit amount of files uploaded at once to 5 for now.
        if (props.uploadType === FileUploadType.DOCUMENTS) {
            return files.length > 0 && files.length < 6;
        }
        return false;
    }

    const onDrop = async (acceptedFiles: Array<File>) => {
        // Handle error. Someone will need to implement this.
        if (!checkValid(acceptedFiles)) {
            // Note: You can access rejected files through the variable "fileRejections" as below.
            console.log(fileRejections);
            console.log("Some files failed to upload.");
            return;
        }

        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append(file.name, file, file.name);
        });

        if (props.uploadType === FileUploadType.PROFILE) {
            await uploadPfp(formData);
        } else if (props.uploadType === FileUploadType.DOCUMENTS) {
            // Append session ID at the end of the form data.
            const obj = {
                sid: props.sessionID,
            };

            const json = JSON.stringify(obj);
            const blob = new Blob([json], {
                type: "application/json",
            });

            formData.append("document", blob);
            await uploadFile(formData);
        }
    };

    // File size is checked automatically by react-dropzone through the maxSize property seen below.
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        fileRejections,
    } = useDropzone({
        onDrop,
        maxSize: mfs,
    });

    return (
        <div {...getRootProps()} className="dropContainer">
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="dropMessage">Drop the files here ...</p>
            ) : (
                <p className="dropMessage">
                    Drag 'n' drop some files here, or click here to select files
                </p>
            )}
        </div>
    );
};
