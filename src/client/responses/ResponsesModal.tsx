import React from "react";
import { Modal } from "react-bootstrap";
import { UserType } from "../../types";
import { DisplayContainer } from "./DisplayContainer";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    sid: string;
    userid: string;
    userType: UserType;
    sock: SocketIOClient.Socket;
    modalVisible: boolean;
    closeModal: () => void;
    modalType: "ask" | "result";
};

// Test modal, remove this file when no longer needed.
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
            </Modal>
        </>
    );
};
