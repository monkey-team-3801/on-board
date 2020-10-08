import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { CourseAnnouncementsType } from "../../types";
import { format } from "date-fns/esm";
import { ButtonWithLoadingProp } from "../components";

type Props = {
    announcement: CourseAnnouncementsType & { username: string };
    currentUser: string;
};

export const AnnouncementEntry: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { announcement } = props;

    return (
        <Container className="ml-2">
            <Row>
                <Col>
                    <Row>
                        <header
                            style={{
                                borderLeftColor: `#67579e`,
                            }}
                            className="d-flex justify-content-between pl-2"
                        >
                            <Container fluid>
                                <h2 className="title">{announcement.title}</h2>
                                <h3 className="coursecode">
                                    {announcement.courseCode}
                                </h3>
                                <p className="date">
                                    {format(
                                        new Date(props.announcement.date),
                                        "MM/dd hh:mm"
                                    )}
                                </p>
                            </Container>
                            <Container
                                fluid
                                className="d-flex flex-row-reverse"
                            >
                                {props.currentUser ===
                                    props.announcement.userId && (
                                    <ButtonWithLoadingProp
                                        variant="danger"
                                        size="sm"
                                        style={{
                                            height: "20px",
                                        }}
                                    >
                                        Delete
                                    </ButtonWithLoadingProp>
                                )}
                            </Container>
                        </header>
                    </Row>
                    <Row className="pl-2">
                        <Container fluid className="message">
                            <p>{announcement.content}</p>
                        </Container>
                    </Row>
                    <Row className="pl-2 mt-2">
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
    );
};
