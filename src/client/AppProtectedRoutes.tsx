import React from "react";
import { Container } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { RouteComponentProps } from "react-router-dom";
import { ClassEvent } from "../events";
import { UserDataResponseType } from "../types";
import { SecuredRoute } from "./auth/SecuredRoute";
import { ClassesPageContainer } from "./classes";
import { ClassOpenIndicator } from "./components";
import { UploadTest } from "./filehandler/UploadTest";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { useFetch, useSocket } from "./hooks";
import { Navbar } from "./navbar";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Calendar } from "./timetable/calendar/Calendar";
import { Timetable } from "./timetable/timetable/Timetable";
import { ClassOpenEventData } from "./types";
import { requestIsLoaded } from "./utils";
import { VideoContainer } from "./video/VideoContainer";
import { VideoRoomLobby } from "./video/VideoRoomLobby";

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
            <Navbar {...props} username={data?.username} />
            <ClassOpenIndicator
                {...props}
                event={eventData}
                onClose={() => {
                    setEventData(undefined);
                }}
            />
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
                    <SecuredRoute
                        path="/classes"
                        render={(routerProps: RouteComponentProps) => {
                            return <ClassesPageContainer />;
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
                        path="/upload"
                        render={() => {
                            return <UploadTest userId={userData.id!} />;
                        }}
                    />

                    <SecuredRoute
                        path="/timetable-test"
                        render={(routerProps: RouteComponentProps) => {
                            return <Timetable />;
                        }}
                    />
                    <SecuredRoute
                        path="/video-test"
                        exact
                        render={(routerProps: RouteComponentProps) => {
                            return <VideoRoomLobby />;
                        }}
                        component={VideoRoomLobby}
                    />
                    {/* <SecuredRoute
                        path="/video-test/:roomId"
                        exact
                        render={(
                            routerProps: RouteComponentProps<{ roomId: string }>
                        ) => {
                            return (
                                <VideoContainer
                                    roomId={props.match.params.roomId}
                                />
                            );
                        }}
                    /> */}
                </Switch>
            </Container>
        </>
    );
};
