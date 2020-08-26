import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Calendar } from "./timetable/Calendar";
import { SecuredRoute } from "./auth/SecuredRoute";
import { LoginPage } from "./user/LoginPage";
import { UserHomeContainer } from "./home/UserHomeContainer";

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
                <Route path="/" component={LoginPage} />
            </Switch>
            <br></br>
        </BrowserRouter>
    );
};
