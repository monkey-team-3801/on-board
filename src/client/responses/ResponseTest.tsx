import React from "react";
import { Button, Modal } from "react-bootstrap";
import { UserType } from "../../types";
import { DisplayContainer } from "./DisplayContainer";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    sid: string;
    userid: string;
    userType: UserType;
    sock: SocketIOClient.Socket;
};

// Test modal, remove this file when no longer needed.
export const ResponseTest = (props: Props) => {
    const textDisplay =
        props.userType === UserType.STUDENT
            ? "Answer Questions"
            : "See Responses";
    const [show, setShow] = React.useState<boolean>(false);
    const [displayStage, setDisplayStage] = React.useState<number>(-1);
    const [title, setTitle] = React.useState<string>("");

    const handleShow = (header: string, show: boolean, stage: number) => {
        setShow(show);
        setTitle(header);
        setDisplayStage(stage);
    };

    return (
        <div>
            {(props.userType === UserType.COORDINATOR ||
                props.userType === UserType.TUTOR) && (
                <Button
                    variant="primary"
                    onClick={() => {
                        handleShow("Ask a Question", true, 0);
                    }}
                >
                    Ask a question
                </Button>
            )}
            <Modal
                show={show}
                onHide={() => {
                    setShow(false);
                }}
                size="xl"
                scrollable={true}
                centered={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {displayStage === 0 && (
                        <ResponseOptionsContainer
                            sid={props.sid}
                            closeFunc={setShow}
                            userid={props.userid}
                            sock={props.sock}
                        />
                    )}
                    {displayStage === 1 && (
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
                        variant="primary"
                        onClick={() => {
                            setShow(false);
                        }}
                    >
                        close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Button
                variant="primary"
                onClick={() => {
                    handleShow("Responses", true, 1);
                }}
            >
                {textDisplay}
            </Button>
        </div>
    );
};
