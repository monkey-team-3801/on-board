import React from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useDynamicFetch, useFetch } from "../hooks";
import { requestIsLoaded, requestHasError, requestIsLoading } from "../utils";
import { RouteComponentProps } from "react-router-dom";
import { ButtonWithLoadingProp } from "../components";
import { CourseOptionType } from "../types";
import { CreatePrivateRoomForm } from "./components";
import { CourseListRequestType } from "../../types";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreatePrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [courseData] = useFetch<CourseListRequestType>("/courses/list");
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
            const options = courseData.data.map((course) => {
                return { value: course.code, label: course.code };
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
                submitting={submitting}
                submitText="Create Room"
            >
                {roomId && (
                    <Button
                        className="ml-1 btn-secondary"
                        variant="primary"
                        onClick={() => {
                            props.history.push(`/room/${roomId}`);
                        }}
                    >
                        Join {createdRoomName}
                    </Button>
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
