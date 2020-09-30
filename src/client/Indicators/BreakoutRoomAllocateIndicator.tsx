import React from "react";

import { Col, Button } from "react-bootstrap";
import { BreakoutAllocationEventData } from "../types";
import { RouteComponentProps } from "react-router-dom";
import { Indicator } from "./Indicator";

type Props = RouteComponentProps & {
    event: BreakoutAllocationEventData;
    onClose: () => void;
};

export const BreakoutRoomAllocateIndicator: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { event, onClose } = props;
    return event ? (
        <Indicator onClose={onClose}>
            <Col xs={7}>
                <h5>Breakout Room</h5>
                <p>You are allocated to Room {event.roomIndex}</p>
            </Col>
            <Col xs={5}>
                <div className="join-button">
                    <Button
                        variant="outline-dark"
                        onClick={() => {
                            props.history.push(`/breakout/${event.id}`);
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
