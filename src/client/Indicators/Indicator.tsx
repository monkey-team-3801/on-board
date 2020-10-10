import React from "react";
import { Container, Row } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";
import "./Indicator.less";

type Props = {
    onClose: () => void;
    children: React.ReactNode;
};

export const Indicator: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <Container className="indicator">
            <Row className="align-self-center">
                {props.children}
                <div
                    className="close-button"
                    onClick={() => {
                        props.onClose();
                    }}
                >
                    <AiOutlineClose />
                </div>
            </Row>
        </Container>
    );
};
