import React from "react";
import { Container, Form, Col, Button } from "react-bootstrap";

type Props = {
    createRoom: (roomName: string) => Promise<void>;
};

export const CreateRoomPage: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [roomName, setRoomName] = React.useState<string>("");

    return (
        <Container>
            <Form
                onSubmit={async (e: React.FormEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setRoomName("");
                    await props.createRoom(roomName);
                }}
            >
                <Form.Row>
                    <Col xs="auto">
                        <Form.Label srOnly>Room Name</Form.Label>
                        <Form.Control
                            className="mb-2"
                            id="inlineFormInput"
                            placeholder="Room name"
                            value={roomName}
                            onChange={(e) => {
                                setRoomName(e.target.value);
                            }}
                        />
                    </Col>
                    <Col xs="auto">
                        <Button type="submit" className="mb-2">
                            Create Room
                        </Button>
                    </Col>
                </Form.Row>
            </Form>
        </Container>
    );
};
