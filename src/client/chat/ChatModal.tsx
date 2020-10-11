import React from "react";
import { Modal } from "react-bootstrap";
import { ChatModalStatusContext } from "../context";
import { ChatModalStatusType } from "../types";

type Props = ChatModalStatusType;

export const ChatModal: React.FunctionComponent<Props> = (props: Props) => {
    const modalContext = React.useContext(ChatModalStatusContext);

    return (
        <Modal
            show={props.open}
            onHide={modalContext.onClose}
            size="xl"
            centered
            scrollable
        >
            <Modal.Body>test</Modal.Body>
        </Modal>
    );
};
