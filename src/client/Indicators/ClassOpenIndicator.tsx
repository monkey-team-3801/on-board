import React from "react";
import { Button, Col } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { ClassOpenEventData } from "../types";
import { Indicator } from "./Indicator";

type Props = RouteComponentProps & {
    event: ClassOpenEventData;
    onClose: () => void;
};

export const ClassOpenIndicator: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { event, onClose } = props;
    return event ? (
        <Indicator onClose={onClose}>
            <Col xs={7}>
                <h5>Class Open</h5>
                <p>{event.course}</p>
                <p>{event.roomName}</p>
            </Col>
            <Col xs={5}>
                <div className="join-button">
                    <Button
                        variant="primary"
                        className="peach-gradient"
                        onClick={() => {
                            props.history.push(`/classroom/${event.id}`);
                            onClose();
                        }}
                    >
                        {"Join"}
                    </Button>
                </div>
            </Col>
        </Indicator>
    ) : (
        <></>
    );
};
