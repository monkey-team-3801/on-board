import React from "react";
import { Form, Button, Container, Row } from "react-bootstrap";
import Select from "react-select";

import { useDynamicFetch, useFetch } from "../hooks";
import {
    CourseListResponseType,
    CreateClassroomJobRequestType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { ExecutingEvent } from "../../events";
import { CourseOptionType } from "../types";
import { SimpleDatepicker } from "../components";

const isOptionType = (option: any): option is CourseOptionType => {
    return option?.value && option?.label;
};

type Props = {
    userId: string;
};

export const ScheduleRoomFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [createClassroomResponse, createClassroom] = useDynamicFetch<
        undefined,
        CreateClassroomJobRequestType
    >("/job/create", undefined, false);
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");

    const [roomName, setRoomName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [selectedCourse, setSelectedCourse] = React.useState<
        CourseOptionType | undefined
    >(undefined);
    const [startingTime, setStartingTime] = React.useState<Date>(new Date());

    const [endingTime, setEndingTime] = React.useState<Date>(new Date());

    const isCourseEmpty = React.useMemo(() => {
        return selectedCourse?.value === undefined;
    }, [selectedCourse]);

    const isSubmitting: boolean = React.useMemo(() => {
        return !requestIsLoaded(createClassroomResponse);
    }, [createClassroomResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.map((course) => {
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
                <h3>Create Classroom</h3>
            </Row>
            <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (selectedCourse?.value) {
                        await createClassroom({
                            jobDate: startingTime.toISOString(),
                            executingEvent: ExecutingEvent.CLASS_OPEN,
                            data: {
                                roomName,
                                description,
                                courseCode: selectedCourse?.value,
                                startTime: startingTime.toISOString(),
                                endTime: endingTime.toISOString(),
                            },
                        });
                    }
                }}
            >
                <Form.Group>
                    <Form.Label>Room name</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={(e) => {
                            setRoomName(e.target.value);
                        }}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Select
                        options={courseCodes}
                        value={selectedCourse}
                        onChange={(option) => {
                            if (isOptionType(option)) {
                                setSelectedCourse(option);
                            }
                        }}
                        disabled={isSubmitting}
                        required
                        styles={{
                            control: (x) => ({
                                ...x,
                                borderColor: isCourseEmpty ? "red" : "initial",
                            }),
                        }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Class start time</Form.Label>
                    <SimpleDatepicker
                        time={startingTime}
                        onChange={(time) => {
                            setStartingTime(time);
                        }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Class end time</Form.Label>
                    <SimpleDatepicker
                        time={endingTime}
                        onChange={(time) => {
                            setEndingTime(time);
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
