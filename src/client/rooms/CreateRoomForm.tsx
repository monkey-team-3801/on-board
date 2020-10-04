import React from "react";
import { Container, Form, Button, Row } from "react-bootstrap";

type Props = {
    createRoom: (roomName: string) => Promise<void>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateRoomForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [roomName, setRoomName] = React.useState<string>("");

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    return (
        <Container>
            <Form
                onSubmit={async (e: React.FormEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setRoomName("");
                    await props.createRoom(roomName);
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
                <Button type="submit" className="mb-2">
                    Create Private Room
                </Button>
            </Form>
        </Container>
    );
};
