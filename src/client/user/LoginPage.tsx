import React from "react";

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

    if (data.state === RequestState.LOADING) {
        return <div>Loading</div>;
    }

    return (
        <div>
            <h1>{showRegister ? "Register" : "Login"}</h1>
            {data.state === RequestState.LOADED && <Redirect to="/home" />}
            {showRegister ? (
                <RegisterContainer onFetchSuccess={onFetchSuccess} />
            ) : (
                <LoginContainer onFetchSuccess={onFetchSuccess} />
            )}
            <button onClick={() => setShowRegister(!showRegister)}>
                {showRegister ? "Login" : "Register"}
            </button>
        </div>
    );
};
