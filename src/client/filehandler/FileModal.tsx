import React from "react";
import { Button, Modal } from "react-bootstrap";
import { FileUploadType, RoomType } from "../../types";
import { FileContainer } from "./FileContainer";
import { UploadContainer } from "./UploadContainer";
import { Loader } from "../components";

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
    isLoading?: boolean;
    setShowModal: Function;
    showModal: boolean;
};

export const FileModal = (props: Props) => {
    return (
        <div>
            <Modal
                show={props.showModal}
                onHide={() => {
                    props.setShowModal(false);
                }}
                size="xl"
                scrollable={true}
                centered={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.isLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <FileContainer {...props} id={props.sessionID} />
                            <UploadContainer {...props} />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            props.setShowModal(false);
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
