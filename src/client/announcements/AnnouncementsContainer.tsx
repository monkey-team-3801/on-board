import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import Select from "react-select";
import {
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { useFetch, useDynamicFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestIsLoaded } from "../utils";
import { AnnouncementEntry } from "./AnnouncementEntry";
import "./Announcements.less";

type Props = {
    userId: string;
    refreshKey: number;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

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
    >("/courses/announcements", apiData);

    const [courseData, refreshCourseData] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [textFilter, setTextFilter] = React.useState<string>("");
    const [courseFilter, setCourseFilter] = React.useState<Array<string>>([]);

    React.useEffect(() => {
        refresh();
        refreshCourseData();
    }, [refreshKey, refresh, refreshCourseData]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.courses.map((code) => {
                return { value: code, label: code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    React.useEffect(() => {
        if (requestIsLoaded(announcementsData)) {
            setLoading(false);
        }
    }, [announcementsData, setLoading]);

    const filteredAnnouncements = React.useMemo(() => {
        return (
            announcementsData.data &&
            announcementsData.data?.announcements.filter((entry) => {
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
            <Row className="mt-3">
                <Col xl={6}>
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => {
                            setTextFilter(e.target.value.toLowerCase());
                        }}
                    />
                </Col>
                <Col xl={6}>
                    <Select
                        placeholder="Filter course..."
                        options={courseCodes}
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
            <Container className="announcement-list mt-2">
                {filteredAnnouncements &&
                    filteredAnnouncements.map((announcement, i) => {
                        return (
                            <React.Fragment key={i}>
                                <Row className="announcement my-4">
                                    <AnnouncementEntry
                                        announcement={announcement}
                                        currentUser={props.userId}
                                    />
                                </Row>
                                <hr />
                            </React.Fragment>
                        );
                    })}
            </Container>
        </>
    );
};
