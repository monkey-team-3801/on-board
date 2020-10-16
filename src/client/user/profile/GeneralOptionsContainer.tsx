import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useDynamicFetch } from "../../hooks";
import { requestHasError, requestIsLoaded } from "../../utils";
import { AvatarSettings } from "./AvatarSettings";

type Props = {
    userID: string;
    username: string;
};

export const GeneralOptionsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [userResData, changeUsername] = useDynamicFetch<
        undefined,
        { userID: string; newName: string }
    >("/user/changeUsername", undefined, false);

    const [passwordResData, changePassword] = useDynamicFetch<
        undefined,
        { userID: string; password: string }
    >("/user/changePassword", undefined, false);

    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const handleSubmitUsername = async () => {
        await changeUsername({ userID: props.userID, newName: username });
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const handleSubmitPassword = async () => {
        await changePassword({ userID: props.userID, password: password });
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <Container>
            <Row>
                <Col>
                    <Form>
                        <Form.Group>
                            <Form.Label>
                                <h6>Username</h6>
                            </Form.Label>
                            <Form.Control
                                defaultValue={props.username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                }}
                            ></Form.Control>
                            <Button
                                size="sm"
                                onClick={() => {
                                    handleSubmitUsername();
                                }}
                                disabled={
                                    username === "" ||
                                    username === props.username
                                }
                            >
                                Change
                            </Button>
                            {requestHasError(userResData) && (
                                <p style={{ color: "red" }}>
                                    {userResData.message}
                                </p>
                            )}
                            {requestIsLoaded(userResData) && (
                                <p style={{ color: "red" }}>
                                    Username has been successfully changed!
                                </p>
                            )}
                            <br></br>
                            <Form.Label>
                                <h6>Password</h6>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                type="password"
                            ></Form.Control>
                            <Button
                                size="sm"
                                disabled={password === ""}
                                onClick={() => {
                                    handleSubmitPassword();
                                }}
                            >
                                Change
                            </Button>
                            {requestIsLoaded(passwordResData) && (
                                <p style={{ color: "red" }}>
                                    Password has been successfully changed!
                                </p>
                            )}
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
