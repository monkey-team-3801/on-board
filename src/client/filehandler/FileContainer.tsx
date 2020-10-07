import React from "react";
import "./FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useDynamicFetch } from "../hooks";
import { FileUploadEvent, ResponseFormEvent } from "../../events";
import { FileUploadType, RoomType } from "../../types";

type Props = {
    id: string;
    socket: SocketIOClient.Socket;
    userID: string;
    files: Array<{
        id: string;
        name: string;
        size: number;
        time: string;
        userId: string;
        username: string;
    }>;
    updateFiles: Function;
    roomType: RoomType;
    containerType?: FileUploadType;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const { id, roomType, updateFiles } = props;
    const [, deleteFile] = useDynamicFetch<
        undefined,
        { sid: string; fileId: string; uid: string }
    >("/filehandler/deleteFile", undefined, false);

    // Converts bytes to be displayable.
    const sizeDisplay = (size: number): string => {
        if (size === 0) {
            return "0 Bytes";
        }

        const sizes = ["Bytes", "KB", "MB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));

        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleFileDeletion = async (fileID: string) => {
        await deleteFile({
            sid: props.id,
            fileId: fileID,
            uid: props.userID,
        });
        props.socket.emit(FileUploadEvent.FILE_DELETED, props.id);
        props.updateFiles({
            id: props.id,
            roomType: props.roomType,
            fileUploadType: FileUploadType.DOCUMENTS,
        });
    };

    const updateFileList = React.useCallback(() => {
        updateFiles({
            id: id,
            roomType: roomType,
            fileUploadType: FileUploadType.DOCUMENTS,
        });
    }, [id, roomType, updateFiles]);

    React.useEffect(() => {
        props.socket.on(FileUploadEvent.NEW_FILE, updateFileList);
        props.socket.on(FileUploadEvent.FILE_DELETED, updateFileList);
        props.socket.on(ResponseFormEvent.NEW_RESPONSE, updateFileList);
        return () => {
            props.socket.off(FileUploadEvent.NEW_FILE, updateFileList);
            props.socket.off(FileUploadEvent.FILE_DELETED, updateFileList);
            props.socket.off(ResponseFormEvent.NEW_RESPONSE, updateFileList);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="file-container">
            <h1 className="file-list-header">
                {props.containerType &&
                props.containerType === FileUploadType.RESPONSE
                    ? null
                    : "Uploaded Files"}
            </h1>
            <div>
                {Object.values(props.files).map((file, i) => (
                    <div className="file-bar" key={i}>
                        <div>
                            <div className="file-name">
                                {file.name}
                                {" - "}
                                {sizeDisplay(file.size)}
                                <br></br>
                                {"At: "}
                                {file.time}
                            </div>
                            <a
                                href={`/filehandler/file/${file.id}`}
                                target="_self"
                                download
                                style={{ float: "right" }}
                            >
                                <button className="file-dl-btn">
                                    <FaDownload />
                                </button>
                            </a>
                            {props.userID === file.userId && (
                                <button
                                    style={{ float: "right" }}
                                    className="file-del-btn"
                                    onClick={() => {
                                        handleFileDeletion(file.id);
                                    }}
                                >
                                    <RiDeleteBin2Fill />
                                </button>
                            )}
                            <div>Uploaded by: {file.username}</div>
                            <hr></hr>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
