import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { LoginSuccessResponseType, LoginUserRequestType } from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsUnauthorised } from "../utils";

type Props = RouteComponentProps & {
    onFetchSuccess: (response: LoginSuccessResponseType) => void;
    toggleRegisterForm: (value: boolean) => void;
};

/**
 * Form container for the login view.
 */
export const LoginContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);

    // UserID can be found through userID.data.id on login success.
    const [userData, loginUser] = useDynamicFetch<
        LoginSuccessResponseType,
        LoginUserRequestType
    >("/user/login", undefined, false, props.onFetchSuccess);

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setLoading(true);
        await loginUser({ username, password });
        setLoading(false);
    };

    return (
        <div>
            <h1 className="form-heading">LOGIN</h1>
            <Form onSubmit={(e) => handleSubmit(e)} className="login">
                <div className="formcontent">
                    <Form.Group>
                        <Form.Control
                            className="inputbar purple-gradient-input"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            className="inputbar purple-gradient-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Container>
                        <Row>
                            <div className="login-options">
                                <Col className="center">
                                    <input
                                        type="checkbox"
                                        id="remember-me"
                                        value="remember"
                                    ></input>
                                    <span className="checkmark"></span>
                                    <label className="text-muted">
                                        Remember Me
                                    </label>
                                </Col>
                                <Col className="center">
                                    <p className="forget-password text-muted">
                                        Forgot my Password
                                    </p>
                                </Col>
                            </div>
                        </Row>
                    </Container>
                    <Container>
                        <div className="error-message-container">
                            {requestIsUnauthorised(userData) && (
                                <p>{userData.message}</p>
                            )}
                        </div>
                    </Container>
                    <ButtonWithLoadingProp
                        variant="primary"
                        id="login"
                        type="submit"
                        className="loginbtn"
                        loading={loading}
                        invertLoader
                    >
                        Login
                    </ButtonWithLoadingProp>
                </div>
                <div className="toggle-button">
                    <Button
                        variant="light"
                        type="submit"
                        size="sm"
                        className="toggle-button"
                        onClick={() => {
                            props.toggleRegisterForm(true);
                        }}
                    >
                        Create an account
                    </Button>
                </div>
            </Form>
        </div>
    );
};
