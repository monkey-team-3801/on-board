import React from "react";
import "./ClassOpenIndicator.less";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ClassOpenEventData } from "../types";
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps & {
    event: ClassOpenEventData;
    onClose: () => void;
};

export const ClassOpenIndicator: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { event, onClose } = props;
    return event ? (
        <Container className="class-open-indicator">
            <Row className="align-self-center">
                <Col lg={8}>
                    <h5>Class Open</h5>
                    <p>{`${event.course}: ${event.roomName}`}</p>
                </Col>
                <Col>
                    <Button
                        variant="outline-light"
                        onClick={() => {
                            props.history.push(`/classroom/${event.id}`);
                            onClose();
                        }}
                    >
                        {"Join"}
                    </Button>
                    <Button
                        variant="outline-light"
                        onClick={() => {
                            onClose();
                        }}
                    >
                        {"x"}
                    </Button>
                </Col>
            </Row>
        </Container>
    ) : (
        <></>
    );
};
