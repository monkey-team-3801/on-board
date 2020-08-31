import React from "react";
import { Container, Row } from "react-bootstrap";

import { useFetch } from "../hooks";
import { LoginContainer } from "../user/LoginContainer";
import { RegisterContainer } from "../user/RegisterContainer";
import { RequestState, LocalStorageKey } from "../types";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { LoginSuccessResponseType } from "../../types";
import "../styles/Login.less";

type Props = RouteComponentProps;

export const LoginPage: React.FunctionComponent<Props> = (props: Props) => {
    const { history } = props;
    const [data] = useFetch("/auth");
    const [showRegister, setShowRegister] = React.useState<boolean>(false);

    const onFetchSuccess = React.useCallback(
        (response: LoginSuccessResponseType) => {
            localStorage.setItem(LocalStorageKey.JWT_TOKEN, response.jwtToken);
            history.push("/home");
        },
        [history]
    );

    const toggleRegisterForm = React.useCallback((value: boolean) => {
        setShowRegister(value);
    }, []);

    return (
        <div className="login-page-container">
            {data.state === RequestState.LOADED && <Redirect to="/home" />}
            <Container>
                <Row>
                    <Container className="login-container">
                        <h1>On Board 2020</h1>
                    </Container>
                    <Container className="form-container">
                        <Row>
                            {showRegister ? (
                                <RegisterContainer
                                    onFetchSuccess={onFetchSuccess}
                                    toggleRegisterForm={toggleRegisterForm}
                                    {...props}
                                />
                            ) : (
                                <LoginContainer
                                    onFetchSuccess={onFetchSuccess}
                                    toggleRegisterForm={toggleRegisterForm}
                                    {...props}
                                />
                            )}
                        </Row>
                    </Container>
                </Row>
            </Container>
        </div>
    );
};
