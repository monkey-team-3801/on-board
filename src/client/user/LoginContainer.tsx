import React from "react";
import { Form, Button, Col, Row, Container } from "react-bootstrap";

import { useDynamicFetch } from "../hooks";
import { LoginUserRequestType, LoginSuccessResponseType } from "../../types";
import { Redirect } from "react-router-dom";
import { RequestState } from "../types";
import "../styles/Login.less";

type Props = {
    onFetchSuccess: (response: LoginSuccessResponseType) => void;
    toggleRegisterForm: (value: boolean) => void;
};

export const LoginContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    // UserID can be found through userID.data.id on login success.
    const [userID, loginUser] = useDynamicFetch<
        LoginSuccessResponseType,
        LoginUserRequestType
    >("user/login", undefined, false, props.onFetchSuccess);

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();

        await loginUser({ username, password });
    };

    if (userID.state === RequestState.LOADED) {
        return <Redirect to={"/home"} />;
    }

    return (
        <div>
            <h1 className="form-heading">LOGIN</h1>
            <Form onSubmit={(e) => handleSubmit(e)} className="login">
                <div className="formcontent">
                <Form.Group>
                    {/* <Form.Label>Username</Form.Label> */}
                    <Form.Control
                        className="inputbar"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    {/* <Form.Label>Password</Form.Label> */}
                    <Form.Control
                        className="inputbar"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Container>
                <Row className = "login-options">
                    <Col>
                    <input type="checkbox" id="remember-me" value="remember"></input>
                    <label>Remember Me</label>
                    </Col>
                    <Col>
                    <p>Forgot my Password</p>
                    </Col>
                </Row>
                </Container>

                
                <Button variant="primary" type="submit" className="loginbtn">
                    Login
                </Button>
                </div>

                
            
            <Button
                variant="light"
                type="submit"
                size="sm"
                className="toggle-button"
                onClick={() => {
                    props.toggleRegisterForm(true);
                }}
            >
                Register
            </Button>
            </Form>

            
        </div>
    );
};
