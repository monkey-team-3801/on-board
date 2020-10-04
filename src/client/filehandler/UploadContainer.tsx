import React from "react";
import { useDropzone } from "react-dropzone";
import "../styles/UploadContainer.less";
import { useDynamicFetch } from "../hooks";
import { FileUploadType } from "../../types";
import { FileUploadEvent } from "../../events";

type Props = {
    uploadType: FileUploadType;
    sessionID: string;
    socket: SocketIOClient.Socket;
    userID: string;
    updateFiles: Function;
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
        if (!checkValid(acceptedFiles) && fileRejections.length > 0) {
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
                uid: props.userID,
            };

            const json = JSON.stringify(obj);
            const sessionID = new Blob([json], {
                type: "application/json",
            });

            formData.append("document", sessionID);
            await uploadFile(formData);
            props.socket.emit(FileUploadEvent.NEW_FILE, props.sessionID);
            props.updateFiles({ sid: props.sessionID });
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
        <div>
            <div>
                {fileRejections.length > 0 && (
                    <div style={{ color: "red" }}>
                        <div>The following files failed to upload: </div>
                        {fileRejections.map((file, i) => (
                            <div>{file.file.name}</div>
                        ))}
                    </div>
                )}
            </div>
            <div {...getRootProps()} className="dropContainer">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="dropMessage">Drop the files here ...</p>
                ) : (
                    <p className="dropMessage">
                        Drag 'n' drop some files here, or click here to select
                        files
                    </p>
                )}
            </div>
        </div>
    );
};
