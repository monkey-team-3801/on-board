import React from "react";
import { Alert, Container } from "react-bootstrap";
import {
    UpcomingClassroomSessionData,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { useFetch } from "../hooks";
import { BaseResponseType, CourseOptionType } from "../types";
import {
    baseRoomTypeOptions,
    requestHasError,
    requestIsLoaded,
    requestIsLoading,
} from "../utils";
import { ScheduleRoomForm } from "./components";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    response: BaseResponseType<any>;
    onSubmit: (data: Omit<UpcomingClassroomSessionData, "id">) => Promise<void>;
    submitting?: boolean;
    refreshKey?: number;
};

export const ScheduleRoomFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, refreshKey } = props;

    const [courseData, refreshCourseData] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

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

    React.useEffect(() => {
        refreshCourseData();
    }, [refreshKey, refreshCourseData]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.courses.map((code) => {
                return { value: code, label: code };
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
            {
                <ScheduleRoomForm
                    roomName={roomName}
                    description={description}
                    courseCodes={courseCodes}
                    selectedCourse={selectedCourse}
                    roomType={roomType}
                    startingTime={startingTime}
                    endingTime={endingTime}
                    colourCode={colourCode}
                    setRoomName={setRoomName}
                    setDescription={setDescription}
                    setCourseCodes={setCourseCodes}
                    setSelectedCourse={setSelectedCourse}
                    setRoomType={setRoomType}
                    setStartingTime={setStartingTime}
                    setEndingTime={setEndingTime}
                    setColourCode={setColourCode}
                    submitting={
                        props.submitting || requestIsLoading(courseData)
                    }
                    requestIsLoading={requestIsLoading(props.response)}
                    onSubmit={props.onSubmit}
                    submitText={"Create Room"}
                />
            }
            {requestIsLoaded(props.response) && props.submitting && (
                <Alert variant="success">Successfully edited room</Alert>
            )}
            {new Date().getTime() > startingTime.getTime() && (
                <Alert variant="info">This class will open immediately</Alert>
            )}
            {requestHasError(props.response) && (
                <Alert variant="danger">{props.response.message}</Alert>
            )}
        </Container>
    );
};
