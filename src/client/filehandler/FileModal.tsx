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
    files: Array<{
        id: string;
        name: string;
        size: number;
        time: string;
        userId: string;
        username: string;
    }>;
    roomType: RoomType;
};

export const FileModal = (props: Props) => {
    const [showModal, setShowModal] = React.useState<boolean>(false);

    return (
        <div>
            <Button
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
                    <FileContainer {...props} id={props.sessionID} />
                    <hr></hr>
                    <UploadContainer {...props} />
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
