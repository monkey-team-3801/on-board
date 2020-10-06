import { format } from "date-fns";
import React from "react";
import { Alert, Container, Form } from "react-bootstrap";
import { TwitterPicker } from "react-color";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ExecutingEvent } from "../../events";
import {
    CourseListResponseType,
    CreateClassroomJobRequestType,
} from "../../types";
import { ButtonWithLoadingProp, SimpleDatepicker } from "../components";
import { useDynamicFetch, useFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestHasError, requestIsLoaded, requestIsLoading } from "../utils";

const isOptionType = (option: any): option is CourseOptionType => {
    return option?.value && option?.label;
};

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const baseRoomTypeOptions = [
    {
        value: "Lecture",
        label: "Lecture",
    },
    {
        value: "Tutorial",
        label: "Tutorial",
    },
    {
        value: "Practical",
        label: "Practical",
    },
    {
        value: "Studio",
        label: "Studio",
    },
];

export const ScheduleRoomFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
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
    const [roomType, setRoomType] = React.useState<CourseOptionType>(
        baseRoomTypeOptions[0]!
    );
    const [startingTime, setStartingTime] = React.useState<Date>(new Date());

    const [endingTime, setEndingTime] = React.useState<Date>(
        new Date(new Date().getTime() + 3600000)
    );

    const [colourCode, setColourCode] = React.useState<string>("#5c4e8e");

    const isCourseEmpty = React.useMemo(() => {
        return selectedCourse?.value === undefined;
    }, [selectedCourse]);

    const isSubmitting: boolean = React.useMemo(() => {
        return requestIsLoading(createClassroomResponse);
    }, [createClassroomResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.map((course) => {
                return { value: course.code, label: course.code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            setLoading(false);
        }
    }, [courseData, setLoading]);

    return (
        <Container>
            <Form
                className="mb-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (selectedCourse?.value) {
                        await createClassroom({
                            jobDate: startingTime.toISOString(),
                            executingEvent: ExecutingEvent.CLASS_OPEN,
                            data: {
                                name: roomName,
                                description,
                                roomType: roomType.value,
                                courseCode: selectedCourse?.value,
                                startTime: startingTime.toISOString(),
                                endTime: endingTime.toISOString(),
                                colourCode,
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
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <CreatableSelect
                        options={baseRoomTypeOptions}
                        value={roomType}
                        onChange={(option) => {
                            if (isOptionType(option)) {
                                setRoomType(option);
                            }
                        }}
                        disabled={isSubmitting}
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
                            control: (style) => ({
                                ...style,
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
                <Form.Group>
                    <Form.Label>Room colour code</Form.Label>
                    <div className="d-flex justify-content-center">
                        <TwitterPicker
                            triangle="hide"
                            color={colourCode}
                            onChangeComplete={(colour) => {
                                setColourCode(colour.hex);
                            }}
                        />
                    </div>
                </Form.Group>
                <ButtonWithLoadingProp
                    variant="primary"
                    type="submit"
                    loading={isSubmitting}
                    style={{
                        backgroundColor: colourCode,
                    }}
                >
                    Create
                </ButtonWithLoadingProp>
            </Form>
            {requestHasError(createClassroomResponse) && (
                <Alert variant="danger">
                    {createClassroomResponse.message}
                </Alert>
            )}
            {new Date().getTime() > startingTime.getTime() && (
                <Alert variant="info">This class will open immediately</Alert>
            )}
            {requestIsLoaded(createClassroomResponse) && (
                <Alert variant="success">
                    Successfully scheduled class for{" "}
                    {format(startingTime, "MM/dd hh:mm")}
                </Alert>
            )}
        </Container>
    );
};
