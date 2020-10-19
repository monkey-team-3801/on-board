import React from "react";
import { Alert, Container } from "react-bootstrap";
import { UpcomingClassroomSessionData } from "../../types";
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
    onSubmit: (
        data: Omit<UpcomingClassroomSessionData, "id" | "open">
    ) => Promise<void>;
    courses: Array<string>;
    submitting?: boolean;
    refreshKey?: number;
};

export const ScheduleRoomFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [roomName, setRoomName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

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

    const [colourCode, setColourCode] = React.useState<string>("#7873f5");

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    return (
        <Container>
            {
                <ScheduleRoomForm
                    roomName={roomName}
                    description={description}
                    courseCodes={props.courses.map((code) => {
                        return { value: code, label: code };
                    })}
                    selectedCourse={selectedCourse}
                    roomType={roomType}
                    startingTime={startingTime}
                    endingTime={endingTime}
                    colourCode={colourCode}
                    setRoomName={setRoomName}
                    setDescription={setDescription}
                    setSelectedCourse={setSelectedCourse}
                    setRoomType={setRoomType}
                    setStartingTime={setStartingTime}
                    setEndingTime={setEndingTime}
                    setColourCode={setColourCode}
                    submitting={props.submitting}
                    requestIsLoading={requestIsLoading(props.response)}
                    onSubmit={props.onSubmit}
                    submitText={"Create Room"}
                />
            }
            {requestIsLoaded(props.response) && (
                <Alert variant="success">Successfully created room</Alert>
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
