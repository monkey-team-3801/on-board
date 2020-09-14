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
                <h4>Announcements</h4>
            </Row>
            <div
                className="announcement-container"
                style={{ height: 50, overflow: "auto" }}
            >
                {announcementsData.data.announcements.map((announcement, i) => {
                    return (
                        <Row
                            className="announcement"
                            key={i}
                            style={{
                                marginTop: 20,
                            }}
                        >
                            <Container>
                                <Row>
                                    <Col>
                                        <h6 className="coursecode">
                                            {announcement.courseCode}
                                        </h6>
                                        <h6 className="title">
                                            {announcement.title}
                                        </h6>
                                        <p className="date">
                                            {announcement.date}
                                        </p>
                                        <p className="message">
                                            {announcement.content}
                                        </p>
                                        <p>{announcement.user}</p>
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
