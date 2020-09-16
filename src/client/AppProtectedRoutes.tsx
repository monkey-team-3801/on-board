import React from "react";
import { RouteComponentProps, Switch, Route } from "react-router-dom";
import { Container } from "react-bootstrap";

import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Calendar } from "./timetable/Calendar";
import { SecuredRoute } from "./auth/SecuredRoute";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { UserDataResponseType } from "../types";
import { useFetch, useSocket } from "./hooks";
import { requestIsLoaded } from "./utils";
import { UploadTest } from "./filehandler/UploadTest";
import { ClassEvent } from "../events";
import { ClassOpenIndicator } from "./components";
import { ClassOpenEventData } from "./types";
import { Navbar } from "./navbar";

type Props = RouteComponentProps;

export const AppProtectedRoutes = (props: Props) => {
    const [eventData, setEventData] = React.useState<
        ClassOpenEventData | undefined
    >();

    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");
    const { data } = userDataResponse;

    const userData = React.useMemo(() => {
        return {
            username: data?.username,
            id: data?.id,
            courses: data?.courses,
        };
    }, [data]);

    const { data: event } = useSocket<ClassOpenEventData>(
        ClassEvent.OPEN,
        undefined
    );
    const { username, id, courses } = userData;

    React.useEffect(() => {
        setEventData(event);
    }, [event]);

    if (!requestIsLoaded(userDataResponse)) {
        return <div>Loading</div>;
    }

    if (!username || !id || !courses) {
        props.history.push("/");
        return <></>;
    }

    return (
        <>
            <Navbar {...props} />
            <Container fluid>
                <Switch>
                    <SecuredRoute
                        path="/home"
                        render={(routerProps: RouteComponentProps) => {
                            return (
                                <UserHomeContainer
                                    {...routerProps}
                                    userData={{ username, id, courses }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute path="/calendar-test" component={Calendar} />

                    <Route
                        render={(routerProps: RouteComponentProps) => {
                            return (
                                <ClassOpenIndicator
                                    {...routerProps}
                                    event={eventData}
                                    onClose={() => {
                                        setEventData(undefined);
                                    }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/classroom/:classroomId"
                        render={(
                            routerProps: RouteComponentProps<{
                                classroomId: string;
                            }>
                        ) => {
                            return (
                                <ClassroomPageContainer
                                    {...routerProps}
                                    userData={{ username, id, courses }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/room/:roomId"
                        render={(
                            routerProps: RouteComponentProps<{ roomId: string }>
                        ) => {
                            return (
                                <PrivateRoomContainer
                                    {...routerProps}
                                    userData={{ username, id, courses }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/calendar-test"
                        render={(routerProps: RouteComponentProps) => {
                            return <Calendar {...routerProps} sessions={[]} />;
                        }}
                    />
                    <SecuredRoute
                        path="/upload"
                        render={() => {
                            return <UploadTest userId={userData.id!} />;
                        }}
                    />
                </Switch>
            </Container>
        </>
    );
};
