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
        <Container>
            <Row>
                <h3>Announcements</h3>
            </Row>
            <div
                className="announcement-container"
                style={{ height: 50, overflow: "auto" }}
            >
                {announcementsData.data.announcements.map((announcement, i) => {
                    return (
                        <Row
                            key={i}
                            style={{
                                borderBottom: "1px solid grey",
                                marginTop: 20,
                            }}
                        >
                            <Container>
                                <Row>
                                    <Col>
                                        <h6>{announcement.title}</h6>
                                    </Col>
                                    <Col>
                                        <h6>{announcement.courseCode}</h6>
                                    </Col>
                                    <Col>
                                        <p>{announcement.user}</p>
                                    </Col>
                                    <Col>
                                        <p>{announcement.date}</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p>{announcement.content}</p>
                                    </Col>
                                </Row>
                            </Container>
                        </Row>
                    );
                })}
            </div>
        </Container>
    );
};
