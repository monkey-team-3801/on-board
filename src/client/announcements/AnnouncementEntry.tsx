import { format } from "date-fns/esm";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { CourseAnnouncementsType } from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoading } from "../utils";

type Props = {
    announcement: CourseAnnouncementsType & { username: string };
    currentUser: string;
    onDelete?: () => Promise<void>;
};

export const AnnouncementEntry: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { announcement } = props;

    const [deleteResponse, deleteAnnouncement] = useDynamicFetch<
        undefined,
        { id: string; courseCode: string }
    >("courses/announcements/delete", undefined, false);

    const [deleteDisabled, setDeleteDisabled] = React.useState<boolean>(false);

    return (
        <Container className="ml-2">
            <Row>
                <Col>
                    <Container>
                        <Row>
                            <Col lg="2" className="text-right info-left">
                                <h1 className="text-truncate">
                                    {announcement.courseCode}
                                </h1>
                                <p className="text-muted text-truncate">
                                    {format(
                                        new Date(props.announcement.date),
                                        "MM/dd hh:mm"
                                    )}
                                </p>
                                <Container
                                    fluid
                                    className="d-flex flex-row-reverse"
                                >
                                    <Row>
                                        {props.currentUser ===
                                            props.announcement.userId && (
                                            <ButtonWithLoadingProp
                                                variant="danger"
                                                size="sm"
                                                style={{
                                                    height: "20px",
                                                }}
                                                loading={
                                                    requestIsLoading(
                                                        deleteResponse
                                                    ) || deleteDisabled
                                                }
                                                invertLoader
                                                onClick={async () => {
                                                    await deleteAnnouncement({
                                                        id: announcement.id,
                                                        courseCode:
                                                            announcement.courseCode,
                                                    });
                                                    setDeleteDisabled(true);
                                                    await props.onDelete?.();
                                                    setDeleteDisabled(false);
                                                }}
                                            >
                                                Delete
                                            </ButtonWithLoadingProp>
                                        )}
                                    </Row>
                                </Container>
                            </Col>
                            <Col lg="10" className="info-right">
                                <header className="d-flex justify-content-between align-items-center">
                                    <h1>{announcement.title}</h1>
                                    <div className="orb ripe-malinka-gradient" />
                                </header>

                                <p>{announcement.content}</p>
                                <Row className="mt-4">
                                    <Container fluid className="user-container">
                                        <div className="profile">
                                            <img
                                                src={`/filehandler/getPfp/${
                                                    announcement.userId || ""
                                                }`}
                                                alt="profile"
                                                className="profile-image"
                                            />
                                        </div>
                                        <div className="user">
                                            <h4>{announcement.username}</h4>
                                            <p>Instructor</p>
                                        </div>
                                    </Container>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};
