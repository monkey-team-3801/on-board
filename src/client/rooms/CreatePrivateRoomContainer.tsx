import React from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { useDynamicFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestHasError, requestIsLoaded, requestIsLoading } from "../utils";
import { CreatePrivateRoomForm } from "./components";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refreshKey: number;
    courses: Array<string>;
};

export const CreatePrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;

    const [roomName, setRoomName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
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

    const submitting = React.useMemo(() => {
        return requestIsLoading(createRoomResponse);
    }, [createRoomResponse]);

    return (
        <Container>
            <CreatePrivateRoomForm
                roomName={roomName}
                description={description}
                courseCodes={props.courses.map((code) => {
                    return { value: code, label: code };
                })}
                selectedCourse={selectedCourse}
                setRoomName={setRoomName}
                setDescription={setDescription}
                setSelectedCourse={setSelectedCourse}
                onSubmit={async (data) => {
                    await createRoom(data);
                }}
                submitting={submitting}
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
