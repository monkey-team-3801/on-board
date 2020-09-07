import React from "react";
import { Container, Row, Col} from "react-bootstrap";
// import {ReactComponent as logoWhite} from "./logo_white.svg";

import { useFetch } from "../hooks";
import { LoginContainer } from "../user/LoginContainer";
import { RegisterContainer } from "../user/RegisterContainer";
import { RequestState, LocalStorageKey } from "../types";
import { Redirect } from "react-router-dom";
import { LoginSuccessResponseType } from "../../types";
import "../styles/Login.less";
import { findAllByDisplayValue } from "@testing-library/react";

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
            <Container className="login-section">
                <Row>
                    <Col className="heading-column">
                        <Container className="login-container">
                        <img src="./client/logo_white.png" alt="On Board Logo"/>
                        <h1 id="login-heading">On Board</h1>
                        </Container>
                    </Col>
                </Row>
                <Row>
                    <Col className="heading-column">
                        <Container className="form-container">
                            
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
                                
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
