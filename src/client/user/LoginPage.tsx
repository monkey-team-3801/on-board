import React from "react";
import { Container, Row } from "react-bootstrap";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { LoginSuccessResponseType } from "../../types";
import { useFetch } from "../hooks";
import { ParticlesContainer } from "../particles/ParticlesContainer";
import { LocalStorageKey, RequestState } from "../types";
import { LoginContainer } from "../user/LoginContainer";
import { RegisterContainer } from "../user/RegisterContainer";
import "./Login.less";
import { Loader } from "../components";

type Props = RouteComponentProps;

/**
 * Login page component.
 */
export const LoginPage: React.FunctionComponent<Props> = (props: Props) => {
    const { history } = props;
    const [authResponse] = useFetch("/auth");
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

    if (authResponse.state === RequestState.LOADING) {
        return <Loader full />;
    }

    return (
        <div className="login-page-container">
            {authResponse.state === RequestState.LOADED && (
                <Redirect to="/home" />
            )}
            <ParticlesContainer />
            <Container className="login-section">
                <Container className="login-container">
                    <Row className="heading-row">
                        <div className="heading-row-container">
                            <div className="logo-image"></div>
                            <h1 id="login-heading">On Board</h1>
                        </div>
                    </Row>
                </Container>
                <Container className="form-container">
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
                </Container>
            </Container>
        </div>
    );
};
