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

/**
 * Component to display a single upcoming class.
 */
export const UpcomingClass: React.FunctionComponent<Props> = (props: Props) => {
    const { startTime: startTimeIso, endTime: endTimeIso } = props;

    const startTime = React.useMemo(() => {
        return format(new Date(startTimeIso), "MM/dd hh:mm");
    }, [startTimeIso]);

    const endTime = React.useMemo(() => {
        return format(new Date(endTimeIso), "MM/dd hh:mm");
    }, [endTimeIso]);

    return (
        <Row
            className="class-container my-3 mx-1 p-4"
            style={{
                backgroundColor: props.colourCode || "lightgrey",
            }}
        >
            <Col
                xl="3"
                lg="3"
                md="12"
                className="d-flex align-items-center course-column"
            >
                <Container className="d-flex justify-content-center course-container">
                    <Row className="d-flex justify-content-center course-row">
                        <h1>{props.courseCode}</h1>
                        <p>{props.roomType}</p>
                    </Row>
                </Container>
            </Col>
            <Col xl="6" lg="6" md="12">
                <Container>
                    <Row>
                        <Col>
                            <h1>{props.name}</h1>
                            <p>
                                {`${startTime} -
                                    ${endTime}`}
                            </p>
                            <p>{props.description}</p>
                        </Col>
                    </Row>
                </Container>
            </Col>
            <Col xl="3" lg="3" md="12" className="d-flex align-items-center">
                <Container className="button-container">
                    <Row>
                        <OverlayTrigger
                            overlay={
                                <Tooltip id="disabled-tooltip">
                                    This room is not open!
                                </Tooltip>
                            }
                        >
                            <div style={{ width: "100%" }}>
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
                        <Button variant="light">Download Content</Button>
                        <Button variant="light">Edit</Button>
                    </Row>
                </Container>
            </Col>
        </Row>
    );
};
