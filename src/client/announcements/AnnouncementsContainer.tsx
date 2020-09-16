import React from "react";
import { useFetch } from "../hooks";
import {
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Announcements.less";
type Props = {
    userId: string;
    refreshKey: number;
};

export const AnnouncementsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, refreshKey } = props;

    const apiData = React.useMemo(() => {
        return {
            userId: userId,
        };
    }, [userId]);

    const [announcementsData, refresh] = useFetch<
        GetAnnouncementsResponseType,
        GetAnnouncementsRequestType
    >("/courses/announcements", apiData);

    React.useEffect(() => {
        refresh();
    }, [refreshKey, refresh]);

    if (!requestIsLoaded(announcementsData)) {
        return <div>loading</div>;
    }

    return (
        <Container className="content-container" fluid>
            <Container
                className="content-internal announcements-container"
                fluid
            >
                <Row>
                    <header>
                        <h1>Announcements</h1>
                    </header>
                </Row>
                <div className="announcement-list">
                    {announcementsData.data.announcements.map(
                        (announcement, i) => {
                            return (
                                <Row className="announcement" key={i}>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <Row>
                                                    <header
                                                        style={{
                                                            borderLeftColor: `#${Math.floor(
                                                                Math.random() *
                                                                    16777215
                                                            )
                                                                .toString(16)
                                                                .toString()}`,
                                                        }}
                                                    >
                                                        <h2 className="coursecode">
                                                            {
                                                                announcement.courseCode
                                                            }
                                                        </h2>
                                                        <h3 className="title">
                                                            {announcement.title}
                                                        </h3>
                                                        <p className="date">
                                                            {new Date(
                                                                announcement.date
                                                            ).toDateString()}
                                                        </p>
                                                    </header>
                                                </Row>
                                                <Row>
                                                    <div className="message">
                                                        <p>
                                                            {
                                                                announcement.content
                                                            }
                                                        </p>
                                                    </div>
                                                </Row>
                                                <Row>
                                                    <div className="user">
                                                        <p>
                                                            {announcement.user}
                                                        </p>
                                                    </div>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Container>
                                    <hr />
                                </Row>
                            );
                        }
                    )}
                </div>
            </Container>
        </Container>
    );
};
