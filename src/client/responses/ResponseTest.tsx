import React from "react";
import { Button, Modal } from "react-bootstrap";
import { UserType } from "../../types";
import { DisplayContainer } from "./DisplayContainer";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    sid: string;
    userid: string;
    userType: UserType;
};

// Test modal, remove this file when no longer needed.
export const ResponseTest = (props: Props) => {
    const textDisplay =
        props.userType === UserType.STUDENT
            ? "Answer Questions"
            : "See Responses";
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const [showResult, setShowResult] = React.useState<boolean>(false);
    const [title, setTitle] = React.useState<string>("");

    const handleShow = (header: string, show: boolean) => {
        setShowForm(show);
        setTitle(header);
    };

    const handleShowResult = (header: string, show: boolean) => {
        setShowResult(show);
        setTitle(header);
    };

    return (
        <div>
            {(props.userType === UserType.COORDINATOR ||
                props.userType === UserType.TUTOR) && (
                <Button
                    variant="primary"
                    onClick={() => {
                        handleShow("Ask a Question", true);
                    }}
                >
                    Ask a question
                </Button>
            )}
            <Modal
                show={showForm}
                onHide={() => {
                    setShowForm(false);
                }}
                size="xl"
                scrollable={true}
                centered={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ResponseOptionsContainer
                        sid={props.sid}
                        closeFunc={setShowForm}
                        userid={props.userid}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowForm(false);
                        }}
                    >
                        close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Button
                variant="primary"
                onClick={() => {
                    handleShowResult("Responses", true);
                }}
            >
                {textDisplay}
            </Button>
            <Modal
                show={showResult}
                onHide={() => {
                    setShowResult(false);
                }}
                size="xl"
                scrollable={true}
                centered={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DisplayContainer
                        sessionID={props.sid}
                        uid={props.userid}
                        userType={props.userType}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowResult(false);
                        }}
                    >
                        close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
