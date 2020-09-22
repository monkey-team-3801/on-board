import React from "react";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Calendar } from "./timetable/calendar/Calendar";
import { Timetable } from "./timetable/timetable/Timetable";
import { SecuredRoute } from "./auth/SecuredRoute";
import { LoginPage } from "./user/LoginPage";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { VideoContainer } from "./video/VideoContainer";
import { VideoRoomLobby } from "./video/VideoRoomLobby";
import { AppProtectedRoutes } from "./AppProtectedRoutes";

export const AppRouter: React.FunctionComponent<{}> = () => {
    return (
        <BrowserRouter>
            <Switch>
                <SecuredRoute path="/home" component={UserHomeContainer} />
                <SecuredRoute
                    path="/classroom/:classroomId"
                    component={ClassroomPageContainer}
                />

                <SecuredRoute
                    path="/room/:roomId"
                    component={PrivateRoomContainer}
                />
                <SecuredRoute path="/calendar-test" component={Calendar} />
                <SecuredRoute path="/timetable-test" component={Timetable} />
                <Route path="/video-test" exact component={VideoRoomLobby} />
                <Route
                    path="/video-test/:roomId"
                    exact
                    component={VideoContainer}
                />

                <Route exact path="/" component={LoginPage} />
                <Route component={AppProtectedRoutes} />
            </Switch>
        </BrowserRouter>
    );
};
