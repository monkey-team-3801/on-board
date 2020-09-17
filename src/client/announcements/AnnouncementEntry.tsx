import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { CourseAnnouncementsType } from "../../types";

type Props = {
    announcement: CourseAnnouncementsType & { username: string };
};

export const AnnouncementEntry: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { announcement } = props;

    return (
        <Container>
            <Row>
                <Col>
                    <Row>
                        <header
                            style={{
                                borderLeftColor: `#${Math.floor(
                                    Math.random() * 16777215
                                )
                                    .toString(16)
                                    .toString()}`,
                            }}
                        >
                            <h2 className="coursecode">
                                {announcement.courseCode}
                            </h2>
                            <h3 className="title">{announcement.title}</h3>
                            <p className="date">
                                {new Date(announcement.date).toDateString()}
                            </p>
                        </header>
                    </Row>
                    <Row>
                        <div className="message">
                            <p>{announcement.content}</p>
                        </div>
                    </Row>
                    <Row>
                        <div className="user-container">
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
                        </div>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
