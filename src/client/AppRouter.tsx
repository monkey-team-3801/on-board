import React from "react";
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
import { HomePageContainer } from "./containers/HomePageContainer";
import { ClassroomPageContainer } from "./containers/ClassroomPageContainer";
import { PrivateRoomContainer } from "./containers/PrivateRoomContainer";
import { LoginContainer } from "./user/LoginContainer";

export const AppRouter: React.FunctionComponent<{}> = () => {
    return (
        <BrowserRouter>
            <Link to="/home">home</Link>
            <Switch>
                <Route path="/home" component={HomePageContainer} />
                <Route
                    path="/classroom/:classroomId"
                    component={ClassroomPageContainer}
                />
                <Route path="/room/:roomId" component={PrivateRoomContainer} />
                <Route path="/login" component={LoginContainer} />
                <Route>
                    <Redirect to="/home" />
                </Route>
            </Switch>
        </BrowserRouter>
    );
};
