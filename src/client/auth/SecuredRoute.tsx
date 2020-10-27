import React from "react";
import {
    RouteProps,
    Redirect,
    Route,
    RouteComponentProps,
} from "react-router-dom";

import { RequestState, BaseResponseType } from "../types";
import { Loader } from "../components";

/**
 * React Router Route which requires an authorisation to connect.
 */
export const SecuredRoute: React.FunctionComponent<
    RouteProps & {
        authData: BaseResponseType<never>;
    }
> = ({ component, ...props }) => {
    const { authData: data } = props;

    return (
        <Route
            {...props}
            render={(componentProps: RouteComponentProps) => {
                if (data.state === RequestState.UNAUTHORISED) {
                    return <Redirect to="/" />;
                } else if (data.state === RequestState.LOADING) {
                    return <Loader full />;
                } else {
                    return props.render?.(componentProps);
                }
            }}
        />
    );
};
