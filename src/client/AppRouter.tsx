import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { HomePageContainer } from "./containers/HomePageContainer";
import { ClassroomPageContainer } from "./containers/ClassroomPageContainer";
import { PrivateRoomContainer } from "./containers/PrivateRoomContainer";

export const AppRouter: React.FunctionComponent<{}> = () => {
    return (
        <BrowserRouter>
            <ul>
                <li>
                    <Link to="/home">home</Link>
                </li>
                <li>
                    <Link to="/classroom/yourClassRoomId">classroom</Link>
                </li>
                <li>
                    <Link to="/room/yourPrivateRoomId">private room</Link>
                </li>
            </ul>
            <Switch>
                <Route path="/home" component={HomePageContainer} />
                <Route
                    path="/classroom/:classroomId"
                    component={ClassroomPageContainer}
                />
                <Route path="/room/:roomId" component={PrivateRoomContainer} />
                <Route>
                    <div>default</div>
                </Route>
            </Switch>
        </BrowserRouter>
    );
};
