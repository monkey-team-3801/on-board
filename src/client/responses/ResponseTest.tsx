import React from "react";
import { Button, Modal } from "react-bootstrap";
import { DisplayContainer } from "./DisplayContainer";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    sid: string;
    userid: string;
};

// Test modal, remove this file when no longer needed.
export const ResponseTest = (props: Props) => {
    const [showForm, setShowForm] = React.useState(false);
    const [showResult, setShowResult] = React.useState(false);

    return (
        <div>
            <Button
                variant="primary"
                onClick={() => {
                    setShowForm(true);
                }}
            >
                Ask a question
            </Button>
            <Modal
                show={showForm}
                onHide={() => {
                    setShowForm(false);
                }}
            >
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
                    setShowResult(true);
                }}
            >
                See responses
            </Button>
            <Modal
                show={showResult}
                onHide={() => {
                    setShowResult(false);
                }}
            >
                <Modal.Body>
                    <DisplayContainer
                        sessionID={props.sid}
                        uid={props.userid}
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
