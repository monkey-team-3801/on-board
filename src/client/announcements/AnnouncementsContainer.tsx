import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import Select from "react-select";
import {
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
} from "../../types";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { AnnouncementEntry } from "./AnnouncementEntry";
import "./Announcements.less";

type Props = {
    // Current user id.
    userId: string;
    // Refresh key for automatically refeshing the container.
    refreshKey: number;
    // Setter for the loading state.
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // Array of enrolled courses.
    courses: Array<string>;
    // Array of online users.
    onlineUsers: Array<string>;
};
/**
 * Container containing a list of all announcements.
 */
export const AnnouncementsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, refreshKey, setLoading } = props;

    const apiData = React.useMemo(() => {
        return {
            userId: userId,
        };
    }, [userId]);

    const [announcementsData, refresh] = useFetch<
        GetAnnouncementsResponseType,
        GetAnnouncementsRequestType
    >("/courses/announcements", apiData, false);

    const [textFilter, setTextFilter] = React.useState<string>("");
    const [courseFilter, setCourseFilter] = React.useState<Array<string>>([]);

    React.useEffect(() => {
        refresh();
    }, [refreshKey, refresh]);

    React.useEffect(() => {
        if (requestIsLoaded(announcementsData)) {
            setLoading(false);
        }
    }, [announcementsData, setLoading]);

    const filteredAnnouncements = React.useMemo(() => {
        return (
            announcementsData.data &&
            announcementsData.data.announcements.filter((entry) => {
                return (
                    (entry.content.toLowerCase().includes(textFilter) ||
                        entry.title.toLowerCase().includes(textFilter) ||
                        entry.username.toLowerCase().includes(textFilter)) &&
                    (courseFilter.length === 0 ||
                        courseFilter.includes(entry.courseCode))
                );
            })
        );
    }, [announcementsData, textFilter, courseFilter]);

    return (
        <>
            <Container className="announcement-list">
                <Row className="d-flex justify-content-center">
                    <p className="text-muted">You have reached the top...</p>
                </Row>
                {filteredAnnouncements &&
                    filteredAnnouncements.map((announcement, i) => {
                        return (
                            <React.Fragment key={i}>
                                <Row className="announcement mt-5 mb-5">
                                    <AnnouncementEntry
                                        announcement={announcement}
                                        currentUser={props.userId}
                                        onDelete={async () => {
                                            await refresh();
                                        }}
                                        isUserOnline={props.onlineUsers.includes(
                                            announcement.userId
                                        )}
                                    />
                                </Row>
                            </React.Fragment>
                        );
                    })}
            </Container>
            <Row>
                <Col xl={6}>
                    <Form.Label>Filter text</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => {
                            setTextFilter(e.target.value.toLowerCase());
                        }}
                    />
                </Col>
                <Col xl={6}>
                    <Form.Label>Filter courses</Form.Label>
                    <Select
                        placeholder="Filter course..."
                        options={props.courses.map((code) => {
                            return { value: code, label: code };
                        })}
                        isClearable
                        isMulti
                        onChange={(option) => {
                            if (Array.isArray(option)) {
                                setCourseFilter(
                                    option.map((option) => {
                                        return option.value;
                                    })
                                );
                            }
                        }}
                    />
                </Col>
            </Row>
        </>
    );
};
