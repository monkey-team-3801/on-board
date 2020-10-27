import React from "react";
import { Alert, Col, Container, Form, Row } from "react-bootstrap";
import { ButtonWithLoadingProp } from "../../components";
import { useDynamicFetch } from "../../hooks";
import {
    requestHasError,
    requestIsLoaded,
    requestIsLoading,
} from "../../utils";
import { AvatarSettings } from "./AvatarSettings";

type Props = {
    userID: string;
    username: string;
    refreshUserData: () => Promise<void>;
};

/**
 * User settings configuration.
 */
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
    };

    const handleSubmitPassword = async () => {
        await changePassword({ userID: props.userID, password: password });
    };

    return (
        <Container>
            <Row>
                <Col lg="9">
                    <Form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await handleSubmitUsername();
                            await props.refreshUserData();
                        }}
                    >
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
                            <ButtonWithLoadingProp
                                type="submit"
                                size="sm"
                                disabled={
                                    username === "" ||
                                    username === props.username
                                }
                                className="m-0 mt-2"
                                loading={requestIsLoading(userResData)}
                                invertLoader
                            >
                                Change
                            </ButtonWithLoadingProp>
                        </Form.Group>
                        {requestHasError(userResData) && (
                            <Alert variant="danger">
                                {userResData.message}
                            </Alert>
                        )}
                        {requestIsLoaded(userResData) && (
                            <Alert variant="success">
                                Username has been successfully changed!
                            </Alert>
                        )}
                    </Form>

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitPassword();
                        }}
                    >
                        <Form.Group>
                            <Form.Label>
                                <h6>Password</h6>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                type="password"
                            ></Form.Control>
                            <ButtonWithLoadingProp
                                type="submit"
                                size="sm"
                                disabled={password === ""}
                                className="m-0 mt-2"
                                loading={requestIsLoading(passwordResData)}
                                invertLoader
                            >
                                Change
                            </ButtonWithLoadingProp>
                            {requestIsLoaded(passwordResData) && (
                                <Alert variant="success">
                                    Password has been successfully changed!
                                </Alert>
                            )}
                        </Form.Group>
                    </Form>
                </Col>
                <Col lg="3">
                    <AvatarSettings {...props} />
                </Col>
            </Row>
        </Container>
    );
};
