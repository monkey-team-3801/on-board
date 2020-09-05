import React from "react";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { Form, Button, Container, Row } from "react-bootstrap";
import Select from "react-select";

import { useDynamicFetch, useFetch } from "../hooks";
import {
    CourseListResponseType,
    CreateAnnouncementJobRequestType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { ExecutingEvent } from "../../events";
import { CourseOptionType } from "../types";

type Props = {
    userId: string;
};

export const CreateAnnouncementsForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [createAnnouncementResponse, createAnnouncement] = useDynamicFetch<
        undefined,
        CreateAnnouncementJobRequestType
    >("/job/create", undefined, false);
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");

    const [title, setTitle] = React.useState<string>("");
    const [content, setContent] = React.useState<string>("");
    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [courses, setCourses] = React.useState<Array<CourseOptionType>>([]);
    const [announcementTime, setAnnouncementTime] = React.useState<Date>(
        new Date()
    );

    const isCourseEmpty = React.useMemo(() => {
        return courses.length === 0;
    }, [courses]);

    const isSubmitting: boolean = React.useMemo(() => {
        return !requestIsLoaded(createAnnouncementResponse);
    }, [createAnnouncementResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData?.data?.map((course) => {
                return { value: course.code, label: course.code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    if (!requestIsLoaded(courseData)) {
        return <div>loading</div>;
    }

    return (
        <Container>
            <Row>
                <h3>Create Announcement</h3>
            </Row>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    courses.forEach((option) => {
                        createAnnouncement({
                            jobDate: announcementTime.toISOString(),
                            executingEvent: ExecutingEvent.ANNOUNCEMENT,
                            data: {
                                title,
                                content,
                                user: props.userId,
                                courseCode: option.value,
                            },
                        });
                    });
                }}
            >
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        onChange={(e) => {
                            setContent(e.target.value);
                        }}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Select
                        options={courseCodes}
                        value={courses}
                        onChange={(value) => {
                            if (value && Array.isArray(value)) {
                                setCourses(value);
                            } else {
                                setCourses([]);
                            }
                        }}
                        disabled={isSubmitting}
                        isMulti
                        required
                        closeMenuOnSelect={false}
                        styles={{
                            control: (x) => ({
                                ...x,
                                borderColor: isCourseEmpty ? "red" : "initial"
                            })
                        }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Schedule announcement</Form.Label>
                    <Form.Control
                        value={format(announcementTime, "yyyy-MM-dd'T'HH:mm")}
                        type="datetime-local"
                        onChange={(e) => {
                            setAnnouncementTime(
                                parse(
                                    e.target.value,
                                    "yyyy-MM-dd'T'HH:mm",
                                    new Date()
                                )
                            );
                        }}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Create
                </Button>
            </Form>
        </Container>
    );
};
