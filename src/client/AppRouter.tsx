import React from "react";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import { LoginPage } from "./user/LoginPage";
import { ChatModalStatusContext } from "./context";
import { AppProtectedRoutes } from "./AppProtectedRoutes";
import { ChatModalStatusType } from "./types";

export const AppRouter: React.FunctionComponent<{}> = () => {
    const [chatModalStatus, setChatModalStatus] = React.useState<
        ChatModalStatusType
    >({
        open: false,
    });

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={LoginPage} />

                <ChatModalStatusContext.Provider
                    value={{
                        status: chatModalStatus,
                        onClose: () => {
                            setChatModalStatus((prev) => {
                                return {
                                    ...prev,
                                    open: false,
                                };
                            });
                        },
                        onOpen: () => {
                            setChatModalStatus((prev) => {
                                return {
                                    ...prev,
                                    open: true,
                                };
                            });
                        },
                    }}
                >
                    <Route component={AppProtectedRoutes} />
                </ChatModalStatusContext.Provider>
            </Switch>
        </BrowserRouter>
    );
};
