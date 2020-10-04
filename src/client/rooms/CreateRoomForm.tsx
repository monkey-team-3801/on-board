import React from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestHasError, requestIsLoading } from "../utils";
import { RouteComponentProps } from "react-router-dom";
import { ButtonWithLoadingProp } from "../components";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateRoomForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [roomName, setRoomName] = React.useState<string>("");
    const [roomId, setRoomId] = React.useState<string | undefined>();
    const [createdRoomName, setCreatedRoomName] = React.useState<
        string | undefined
    >();

    const [createRoomResponse, createRoom] = useDynamicFetch<
        { id: string; name: string },
        { name: string }
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

    const isSubmitting = React.useMemo(() => {
        return requestIsLoading(createRoomResponse);
    }, [createRoomResponse]);

    return (
        <Container>
            <Form
                className="mb-2"
                onSubmit={async (e: React.FormEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setRoomName("");
                    await createRoom({
                        name: roomName,
                    });
                }}
            >
                <Form.Group>
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control
                        className="mb-2"
                        id="inlineFormInput"
                        placeholder="Room name"
                        value={roomName}
                        onChange={(e) => {
                            setRoomName(e.target.value);
                        }}
                    />
                </Form.Group>
                <ButtonWithLoadingProp
                    type="submit"
                    invertLoader
                    loading={isSubmitting}
                >
                    Create Private Room
                </ButtonWithLoadingProp>
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
            </Form>
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
