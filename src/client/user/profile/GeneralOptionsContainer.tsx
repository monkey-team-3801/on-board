import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { AvatarSettings } from "./AvatarSettings";

type Props = {
    userID: string;
    username: string;
};

export const GeneralOptionsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container>
            <h2>General</h2>
            <h5>Change your personal details here.</h5>
            <hr></hr>
            <Row>
                <Col>
                    <Form>
                        <Form.Group>
                            <Form.Label>
                                <h6>Username</h6>
                            </Form.Label>
                            <Form.Control
                                defaultValue={props.username}
                            ></Form.Control>
                            <Button size="sm">Change</Button>
                            <br></br>
                            <Form.Label>
                                <h6>Password</h6>
                            </Form.Label>
                            <Form.Control></Form.Control>
                            <Button size="sm">Change</Button>
                        </Form.Group>
                    </Form>
                </Col>
                <Col md="auto">
                    <AvatarSettings {...props} />
                </Col>
            </Row>
        </Container>
    );
};
