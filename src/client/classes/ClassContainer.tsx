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
import { ButtonWithLoadingProp } from "../components";
import "./Classes.less";

type Props = Partial<UpcomingClassroomSessionData> & {
    size: "sm" | "lg";
    canEdit?: boolean;
    canJoin?: boolean;
    onJoinClick?: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    isDeleting?: boolean;
};

export const ClassContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { startTime: startTimeIso, endTime: endTimeIso } = props;

    const startTime = React.useMemo(() => {
        return startTimeIso && format(new Date(startTimeIso), "MM/dd hh:mm");
    }, [startTimeIso]);

    const endTime = React.useMemo(() => {
        return endTimeIso && format(new Date(endTimeIso), "MM/dd hh:mm");
    }, [endTimeIso]);

    return (
        <Row
            className="class-container my-3 mx-1 p-4"
            style={{
                backgroundColor: props.colourCode || "lightgrey",
            }}
        >
            <Col
                lg={props.size === "sm" ? 3 : 2}
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
            <Col lg={props.size === "sm" ? 6 : 8} md="12">
                <Container fluid>
                    <Row>
                        <Col>
                            <h1>{props.name}</h1>
                            {startTime && endTime && (
                                <p>
                                    {`${startTime} -
                                    ${endTime}`}
                                </p>
                            )}
                            <p>{props.description}</p>
                        </Col>
                    </Row>
                </Container>
            </Col>
            <Col
                lg={props.size === "sm" ? 3 : 2}
                md="12"
                className="d-flex align-items-center"
            >
                <Container className="button-container">
                    <Row>
                        {props.canJoin ? (
                            <Button variant="light" onClick={props.onJoinClick}>
                                Join
                            </Button>
                        ) : (
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
                        )}

                        <Button variant="light">Download Content</Button>
                        {props.canEdit && (
                            <>
                                <Col md={6} className="p-0">
                                    <Button
                                        variant="info"
                                        onClick={props.onEditClick}
                                    >
                                        Edit
                                    </Button>
                                </Col>
                                <Col md={6} className="p-0">
                                    <ButtonWithLoadingProp
                                        variant="danger"
                                        onClick={props.onDeleteClick}
                                        loading={props.isDeleting}
                                        invertLoader
                                        style={{
                                            height: "100%",
                                        }}
                                    >
                                        Delete
                                    </ButtonWithLoadingProp>
                                </Col>
                            </>
                        )}
                    </Row>
                </Container>
            </Col>
        </Row>
    );
};
