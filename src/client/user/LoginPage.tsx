import React from "react";
import { Container, Row } from "react-bootstrap";

import { useFetch } from "../hooks";
import { LoginContainer } from "../user/LoginContainer";
import { RegisterContainer } from "../user/RegisterContainer";
import { RequestState, LocalStorageKey } from "../types";
import { Redirect } from "react-router-dom";
import { LoginSuccessResponseType } from "../../types";

type Props = {};

export const LoginPage: React.FunctionComponent<Props> = (props: Props) => {
    const [data] = useFetch("/auth");
    const [showRegister, setShowRegister] = React.useState<boolean>(false);

    const onFetchSuccess = React.useCallback(
        (response: LoginSuccessResponseType) => {
            localStorage.setItem(LocalStorageKey.JWT_TOKEN, response.jwtToken);
        },
        []
    );

    const toggleRegisterForm = React.useCallback((value: boolean) => {
        setShowRegister(value);
    }, []);

    if (data.state === RequestState.LOADING) {
        return <div>Loading</div>;
    }

    return (
        <div className="login-page-container">
            {data.state === RequestState.LOADED && <Redirect to="/home" />}
            <Container>
                <Row>
                    <Container>
                        <h1>On Board 2020</h1>
                    </Container>
                    <Container className="form-container">
                        <Row>
                            {showRegister ? (
                                <RegisterContainer
                                    onFetchSuccess={onFetchSuccess}
                                    toggleRegisterForm={toggleRegisterForm}
                                />
                            ) : (
                                <LoginContainer
                                    onFetchSuccess={onFetchSuccess}
                                    toggleRegisterForm={toggleRegisterForm}
                                />
                            )}
                        </Row>
                    </Container>
                </Row>
            </Container>
        </div>
    );
};
