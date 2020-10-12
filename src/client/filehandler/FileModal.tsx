import React from "react";
import { Button, Modal } from "react-bootstrap";
import { FileUploadType, RoomType } from "../../types";
import { FileContainer } from "./FileContainer";
import { UploadContainer } from "./UploadContainer";

type Props = {
    uploadType: FileUploadType;
    sessionID: string;
    socket: SocketIOClient.Socket;
    userID: string;
    updateFiles: Function;
    files: Array<Array<string>>;
    roomType: RoomType;
    // showmodal
    // modalbutton: Function;
};

export const FileModal = (props: Props) => {
    const [showModal, setShowModal] = React.useState<boolean>(false);

    return (
        <div>
            <Button
                className="file-btn"
                onClick={() => {
                    setShowModal(true);
                }}
            >
                Upload File(s)
            </Button>
            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                }}
                size="xl"
                className="d-flex justify-content-center"
            >
                <Modal.Header closeButton>
                    <Modal.Title>File Upload</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FileContainer
                        socket={props.socket}
                        sessionID={props.sessionID}
                        userID={props.userID}
                        updateFiles={props.updateFiles}
                        files={props.files}
                        roomType={props.roomType}
                    />
                    <hr></hr>
                    <UploadContainer
                        uploadType={FileUploadType.DOCUMENTS}
                        socket={props.socket}
                        sessionID={props.sessionID}
                        userID={props.userID}
                        updateFiles={props.updateFiles}
                        roomType={props.roomType}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowModal(false);
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
