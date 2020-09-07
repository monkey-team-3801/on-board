import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { LoginPage } from "./user/LoginPage";
import { AppProtectedRoutes } from "./AppProtectedRoutes";

export const AppRouter: React.FunctionComponent<{}> = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={LoginPage} />
                <Route component={AppProtectedRoutes} />
            </Switch>
        </BrowserRouter>
    );
};
