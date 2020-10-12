import React from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { UserEnrolledCoursesResponseType } from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestHasError, requestIsLoaded, requestIsLoading } from "../utils";
import { CreatePrivateRoomForm } from "./components";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refreshKey: number;
};

export const CreatePrivateRoomContainer: React.FunctionComponent<Props> = (
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
    const [roomId, setRoomId] = React.useState<string | undefined>();
    const [createdRoomName, setCreatedRoomName] = React.useState<
        string | undefined
    >();

    const [createRoomResponse, createRoom] = useDynamicFetch<
        { id: string; name: string },
        { name: string; description: string; courseCode?: string }
    >("session/create", undefined, false);

    React.useEffect(() => {
        refreshCourseData();
    }, [refreshKey, refreshCourseData]);

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    React.useEffect(() => {
        if (requestIsLoaded(createRoomResponse) && createRoomResponse.data) {
            setRoomId(createRoomResponse.data.id);
            setCreatedRoomName(createRoomResponse.data.name);
        }
    }, [createRoomResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.courses.map((code) => {
                return { value: code, label: code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    const submitting = React.useMemo(() => {
        return requestIsLoading(createRoomResponse);
    }, [createRoomResponse]);

    return (
        <Container>
            <CreatePrivateRoomForm
                roomName={roomName}
                description={description}
                courseCodes={courseCodes}
                selectedCourse={selectedCourse}
                setRoomName={setRoomName}
                setDescription={setDescription}
                setCourseCodes={setCourseCodes}
                setSelectedCourse={setSelectedCourse}
                onSubmit={async (data) => {
                    await createRoom(data);
                }}
                submitting={submitting || requestIsLoading(courseData)}
                submitText="Create Room"
            >
                {roomId && (
                    <>
                        <Button
                            className="ml-1 btn-secondary"
                            variant="primary"
                            onClick={() => {
                                props.history.push(`/room/${roomId}`);
                            }}
                        >
                            Join {createdRoomName}
                        </Button>
                        <Button
                            className="ml-1 btn-secondary"
                            variant="primary"
                            onClick={() => {
                                props.history.push("/classes");
                            }}
                        >
                            View all
                        </Button>
                    </>
                )}
            </CreatePrivateRoomForm>
            {requestIsLoaded(createRoomResponse) && createRoomResponse.data && (
                <Alert variant="success">
                    Successfully created room: {createdRoomName}
                </Alert>
            )}
            {requestHasError(createRoomResponse) && (
                <Alert variant="danger">{createRoomResponse.message}</Alert>
            )}
        </Container>
    );
};
