import React from "react";
import { RouteProps, Redirect, Route } from "react-router-dom";

import { useFetch } from "../hooks";
import { RequestState } from "../types";

export const SecuredRoute: React.FunctionComponent<RouteProps> = ({
    component,
    ...props
}) => {
    const [data] = useFetch("/auth");

    return (
        <Route
            {...props}
            render={(componentProps) => {
                if (component) {
                    if (data.state === RequestState.UNAUTHORISED) {
                        return <Redirect to="/" />;
                    } else if (data.state === RequestState.LOADING) {
                        return <div>Loading</div>;
                    } else {
                        return React.createElement(component, componentProps);
                    }
                }
            }}
        />
    );
};
