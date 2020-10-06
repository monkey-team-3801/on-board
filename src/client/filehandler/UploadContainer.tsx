import React from "react";
import { useDropzone } from "react-dropzone";
import { FileUploadType, RoomType } from "../../types";
import { FileUploadEvent, ResponseFormEvent } from "../../events";
import { useDynamicFetch } from "../hooks";
import "./UploadContainer.less";

type Props = {
    uploadType: FileUploadType;
    sessionID: string;
    socket: SocketIOClient.Socket;
    userID: string;
    updateFiles?: Function;
    roomType: RoomType;
    formID?: string;
    back?: Function;
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
    const maxFileSize = (): number => {
        if (props.uploadType === FileUploadType.DOCUMENTS) {
            return 10000000;
        } else {
            return 1000000;
        }
    };

    const totalFileLength =
        props.uploadType === FileUploadType.DOCUMENTS ? 1 : 5;

    // Max file size.
    const mfs = maxFileSize();

    // Check files are of appropriate length.
    const checkValid = (files: Array<File>): boolean => {
        return files.length > 0 && files.length <= totalFileLength;
    };

    const onDrop = async (acceptedFiles: Array<File>) => {
        if (!checkValid(acceptedFiles) && fileRejections.length > 0) {
            return;
        }

        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append(file.name, file, file.name);
        });

        const IdObj =
            props.uploadType === FileUploadType.RESPONSE
                ? {
                      sid: props.sessionID,
                      uid: props.userID,
                      roomType: props.roomType,
                      uploadType: props.uploadType,
                      formID: props.formID,
                  }
                : {
                      sid: props.sessionID,
                      uid: props.userID,
                      roomType: props.roomType,
                      uploadType: props.uploadType,
                  };
        const json = JSON.stringify(IdObj);
        const IdData = new Blob([json], {
            type: "application/json",
        });

        if (props.uploadType === FileUploadType.PROFILE) {
            await uploadPfp(formData);
        } else if (props.uploadType === FileUploadType.DOCUMENTS) {
            formData.append("document", IdData);
            await uploadFile(formData);

            props.socket.emit(FileUploadEvent.NEW_FILE, props.sessionID);
            if (props.updateFiles) {
                props.updateFiles({
                    id: props.sessionID,
                    roomType: props.roomType,
                    fileUploadType: FileUploadType.DOCUMENTS,
                });
            }
        } else if (props.uploadType === FileUploadType.RESPONSE) {
            formData.append("document", IdData);
            await uploadFile(formData);
            props.socket.emit(ResponseFormEvent.NEW_RESPONSE, props.sessionID);
            if (props.back) {
                setTimeout(() => {
                    if (props.back) {
                        props.back();
                    }
                }, 500);
            }
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
            <div style={{ textAlign: "center" }}>
                {fileRejections.length > 0 && (
                    <div>
                        <div>The following files failed to upload:</div>
                        {fileRejections.map((file, i) => (
                            <div key={i} style={{ color: "red" }}>
                                {file.file.name}
                                <div>Reason: {file.errors[0].message}</div>
                            </div>
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
                        <br></br>
                        Note: You can upload at most 5 files at a time
                    </p>
                )}
            </div>
        </div>
    );
};
