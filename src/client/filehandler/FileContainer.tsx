import React from "react";
import { FaDownload } from "react-icons/fa";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useDynamicFetch } from "../hooks";
import { FileUploadEvent, ResponseFormEvent } from "../../events";
import { FileUploadType, RoomType } from "../../types";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./FileContainer.less";

type Props = {
    // Current session id.
    id: string;
    // Socket relevant to the session.
    socket: SocketIOClient.Socket;
    // Current user id.
    userID: string;
    // Array of files to render.
    files: Array<{
        id: string;
        name: string;
        size: number;
        time: string;
        userId: string;
        username: string;
    }>;
    // Function to refresh the files.
    updateFiles: Function;
    // The room this container is in.
    roomType: RoomType;
    // Which files is the container rendering.
    containerType?: FileUploadType;
};

/**
 * Container to render a list of files.
 */
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
        <Container className="file-container">
            <Row>
                <Col>
                    <h1>
                        {props.containerType &&
                        props.containerType === FileUploadType.RESPONSE
                            ? null
                            : "Uploaded Files"}
                    </h1>
                </Col>
            </Row>
            <Row>
                {props.files.length > 0 ? (
                    Object.values(props.files).map((file, i) => (
                        <Container key={i}>
                            <Row>
                                <Col lg="8">
                                    <p>{file.name}</p>
                                    <p className="text-muted">
                                        {file.time} - {sizeDisplay(file.size)}
                                    </p>
                                    <p className="text-muted">
                                        Uploader: {file.username}
                                    </p>
                                </Col>
                                <Col lg="4" className="d-flex flex-row-reverse">
                                    <Button className="d-flex align-items-center">
                                        <a
                                            href={`/filehandler/file/${file.id}`}
                                            target="_self"
                                            download
                                            style={{
                                                color: "unset",
                                            }}
                                        >
                                            <FaDownload />
                                        </a>
                                    </Button>
                                    {props.userID === file.userId && (
                                        <Button
                                            onClick={() => {
                                                handleFileDeletion(file.id);
                                            }}
                                            variant="danger"
                                            className="d-flex align-items-center"
                                        >
                                            <RiDeleteBin2Fill />
                                        </Button>
                                    )}
                                </Col>
                                <hr></hr>
                            </Row>
                        </Container>
                    ))
                ) : (
                    <Container className="py-4">
                        <p className="text-muted">There are no files</p>
                    </Container>
                )}
            </Row>
        </Container>
    );
};
