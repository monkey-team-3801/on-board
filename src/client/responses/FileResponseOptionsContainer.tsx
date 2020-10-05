import React from "react";
import { Button, Form } from "react-bootstrap";

type Props = {
    question: string;
    sessionID: string;
    closeModal: () => void;
    uid: string;
    sock: SocketIOClient.Socket;
};

export const FileResponseOptionsContainer = (props: Props) => {
    const [description, setDescription] = React.useState<string>("");

    const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
    };

    return (
        <div>
            <Form
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <Form.Group>
                    <Form.Label>Add a description (optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Description..."
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={props.question === ""}
                >
                    Submit
                </Button>
            </Form>
        </div>
    );
};
