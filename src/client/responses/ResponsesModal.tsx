import React from "react";
import { Modal, Button } from "react-bootstrap";
import { UserType } from "../../types";
import { DisplayContainer } from "./DisplayContainer";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    // Current session id.
    sid: string;
    // Current user id.
    userid: string;
    // The type of the current user.
    userType: UserType;
    // Session socket instance.
    sock: SocketIOClient.Socket;
    // Modal visibility state.
    modalVisible: boolean;
    // Method to close the modal.
    closeModal: () => void;
    // Which title to render the modal with.
    modalType: "ask" | "result";
};

/**
 * Modal for creating and answering responses.
 */
export const ResponsesModal = (props: Props) => {
    return (
        <>
            <Modal
                show={props.modalVisible}
                onHide={() => {
                    props.closeModal();
                }}
                size="xl"
                scrollable={true}
                centered={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {props.modalType === "ask"
                            ? "Ask Students"
                            : props.userType === UserType.STUDENT
                            ? "Questions"
                            : "View Results"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.modalType === "ask" && (
                        <ResponseOptionsContainer
                            sid={props.sid}
                            closeModal={props.closeModal}
                            userid={props.userid}
                            sock={props.sock}
                        />
                    )}
                    {props.modalType === "result" && (
                        <DisplayContainer
                            sessionID={props.sid}
                            uid={props.userid}
                            userType={props.userType}
                            sock={props.sock}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            props.closeModal();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
