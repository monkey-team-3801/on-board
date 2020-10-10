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
import {
    RoomType,
    SessionDeleteRequestType,
    UpcomingClassroomSessionData,
} from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoading } from "../utils";
import "./Classes.less";

type Props = Partial<UpcomingClassroomSessionData> & {
    id?: string;
    size: "sm" | "lg";
    canEdit?: boolean;
    canJoin?: boolean;
    onJoinClick?: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    isRefreshing?: boolean;
    type: RoomType;
    setDeletedRooms?: React.Dispatch<React.SetStateAction<Array<string>>>;
};

export const ClassContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const {
        startTime: startTimeIso,
        endTime: endTimeIso,
        isRefreshing: parentRefreshing,
    } = props;

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
    >("session/delete/classroom", undefined, false);

    const [deleteJobResponse, deleteJob] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
    >("job/delete", undefined, false);

    const [deletePrivateRoomResponse, deletePrivateRoom] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
    >("session/delete/privateRoom", undefined, false);

    const startTime = React.useMemo(() => {
        return startTimeIso && format(new Date(startTimeIso), "MM/dd hh:mm");
    }, [startTimeIso]);

    const endTime = React.useMemo(() => {
        return endTimeIso && format(new Date(endTimeIso), "MM/dd hh:mm");
    }, [endTimeIso]);

    const isRefreshing = React.useMemo(() => {
        return (
            requestIsLoading(deleteRoomResponse) ||
            requestIsLoading(deleteJobResponse) ||
            requestIsLoading(deletePrivateRoomResponse) ||
            parentRefreshing
        );
    }, [
        deleteRoomResponse,
        deleteJobResponse,
        deletePrivateRoomResponse,
        parentRefreshing,
    ]);

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
                        {props.canEdit && (
                            <>
                                <Col md={6} className="p-0">
                                    <Button
                                        variant="info"
                                        onClick={props.onEditClick}
                                        disabled={requestIsLoading(
                                            deletePrivateRoomResponse
                                        )}
                                    >
                                        Edit
                                    </Button>
                                </Col>
                                <Col md={6} className="p-0">
                                    <ButtonWithLoadingProp
                                        variant="danger"
                                        onClick={async () => {
                                            if (props.id) {
                                                if (
                                                    props.type ===
                                                    RoomType.CLASS
                                                ) {
                                                    await deleteRoom({
                                                        id: props.id,
                                                    });
                                                } else if (
                                                    props.type ===
                                                    RoomType.UPCOMING
                                                ) {
                                                    await deleteJob({
                                                        id: props.id,
                                                    });
                                                } else if (
                                                    props.type ===
                                                    RoomType.PRIVATE
                                                ) {
                                                    await deletePrivateRoom({
                                                        id: props.id,
                                                    });
                                                }
                                                props.setDeletedRooms?.(
                                                    (prev) => {
                                                        return prev.concat([
                                                            props.id!,
                                                        ]);
                                                    }
                                                );
                                                props.onDeleteClick?.();
                                            }
                                        }}
                                        loading={requestIsLoading(
                                            deletePrivateRoomResponse
                                        )}
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
