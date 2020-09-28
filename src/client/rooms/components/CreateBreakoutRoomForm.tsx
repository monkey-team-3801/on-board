import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";

type Props = {
    onCreate: (amount: number) => void;
};

export const CreateBreakoutRoomForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [roomAmount, setRoomAmount] = React.useState<number>(1);

    const isValid = React.useMemo(() => {
        return roomAmount <= 20 && roomAmount >= 1;
    }, [roomAmount]);

    return (
        <Form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (isValid) {
                    props.onCreate(roomAmount);
                }
            }}
        >
            <Form.Row>
                <Col xs="auto">
                    <Form.Label htmlFor="inlineFormInput" srOnly>
                        Name
                    </Form.Label>
                    <Form.Control
                        className="mb-2"
                        id="inlineFormInput"
                        placeholder="# Rooms"
                        type="number"
                        value={roomAmount}
                        onChange={(e) => {
                            setRoomAmount(Number(e.target.value));
                        }}
                        isInvalid={!isValid}
                    />
                    <Form.Control.Feedback type="invalid">
                        Rooms should be between 1 and 20
                    </Form.Control.Feedback>
                </Col>
            </Form.Row>
            <Form.Row>
                <Button type="submit" variant="success" className="mb-2">
                    Create
                </Button>
            </Form.Row>
        </Form>
    );
};
