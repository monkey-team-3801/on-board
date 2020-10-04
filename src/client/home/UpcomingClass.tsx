import format from "date-fns/format";
import React from "react";
import {
    Button,
    Col,
    Container,
    OverlayTrigger,
    Row,
    Tooltip,
} from "react-bootstrap";
import { UpcomingClassroomSessionData } from "../../types";

type Props = UpcomingClassroomSessionData;

export const UpcomingClass: React.FunctionComponent<Props> = (props: Props) => {
    const { startTime: startTimeIso, endTime: endTimeIso } = props;

    const startTime = React.useMemo(() => {
        return format(new Date(startTimeIso), "MM/dd hh:mm");
    }, [startTimeIso]);

    const endTime = React.useMemo(() => {
        return format(new Date(endTimeIso), "MM/dd hh:mm");
    }, [endTimeIso]);

    return (
        <Container
            className="class-container"
            style={{
                backgroundColor: props.colourCode || "lightgrey",
            }}
        >
            <Row>
                <Col xl="6" lg="6" md="12">
                    <div className="content content-left">
                        <Container className="course-code-container d-flex justify-content-center">
                            <div>
                                <Row>
                                    <h1 className="text-center">
                                        {props.courseCode}
                                    </h1>
                                </Row>
                                <Row>
                                    <p className="text-center">
                                        {props.roomType}
                                    </p>
                                </Row>
                            </div>
                        </Container>
                        <div className="info-container">
                            <h2>{props.name}</h2>
                            <p>
                                {`${startTime} -
                                    ${endTime}`}
                            </p>
                            <p>{props.description}</p>
                            <div className="download-container">
                                <Button variant="light" size="sm">
                                    Download Class Content
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xl="6" lg="6" md="12">
                    <div className="content content-right">
                        <div className="connect">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id="disabled-tooltip">
                                        This room is not open!
                                    </Tooltip>
                                }
                            >
                                <div>
                                    <Button
                                        variant="light"
                                        disabled
                                        style={{
                                            pointerEvents: "none",
                                        }}
                                    >
                                        Join
                                    </Button>
                                </div>
                            </OverlayTrigger>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
