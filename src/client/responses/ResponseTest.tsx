import React from "react";
import { Button, Modal } from "react-bootstrap";
import { ResponseOptionsContainer } from "./ResponseOptionsContainer";

type Props = {
    sid: string;
};

export const ResponseTest = (props: Props) => {
    const [show, setShow] = React.useState(false);

    const handleOpen = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
    };

    return (
        <div>
            <Button variant="primary" onClick={handleOpen}>
                Ask a question
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    <ResponseOptionsContainer
                        sid={props.sid}
                        closeFunc={handleClose}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
