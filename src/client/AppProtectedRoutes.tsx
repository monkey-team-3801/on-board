import React from "react";
import { Container } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { RouteComponentProps } from "react-router-dom";
import { ClassEvent, RoomEvent } from "../events";
import { UserDataResponseType, RoomType } from "../types";
import { SecuredRoute } from "./auth/SecuredRoute";
import { ClassesPageContainer } from "./classes";
import { Loader } from "./components";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { useFetch, useSocket } from "./hooks";
import { ClassOpenIndicator } from "./Indicators";
import { Navbar } from "./navbar";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Timetable } from "./timetable/timetable/Timetable";
import { ClassOpenEventData, ChatModalStatusType } from "./types";
import { requestIsLoaded } from "./utils";
import { ChatModalStatusContext } from "./context";
import { ChatModal } from "./chat";
import { socket } from "./io";

type Props = RouteComponentProps;

export const AppProtectedRoutes = (props: Props) => {
    const [eventData, setEventData] = React.useState<
        ClassOpenEventData | undefined
    >();

    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");
    const { data } = userDataResponse;

    const [authData] = useFetch<never>("/auth");

    const userData = React.useMemo(() => {
        return {
            username: data?.username,
            id: data?.id,
            courses: data?.courses,
            userType: data?.userType,
        };
    }, [data]);

    const { data: event } = useSocket<ClassOpenEventData>(
        ClassEvent.OPEN,
        undefined
    );
    const { username, id, courses, userType } = userData;

    React.useEffect(() => {
        setEventData(event);
    }, [event]);

    React.useEffect(() => {
        if (userData.id) {
            socket.connect().emit(RoomEvent.SESSION_JOIN, {
                sessionId: "global",
                userId: userData.id,
            });
        }
        return () => {
            if (userData.id) {
                socket.disconnect();
            }
        };
    }, [userData]);

    if (!requestIsLoaded(userDataResponse)) {
        return <Loader full />;
    }

    if (!username || !id || !courses || userType === undefined) {
        props.history.push("/");
        return <></>;
    }

    return (
        <>
            <Navbar {...props} username={data?.username} userid={data?.id} />
            <ClassOpenIndicator
                {...props}
                event={eventData}
                onClose={() => {
                    setEventData(undefined);
                }}
            />
            <ChatModalStatusContext.Consumer>
                {(context) => {
                    return (
                        <ChatModal
                            {...context.status}
                            myUserId={id}
                            myUsername={username}
                        />
                    );
                }}
            </ChatModalStatusContext.Consumer>
            <Container fluid style={{ marginTop: "50px" }}>
                <Switch>
                    <SecuredRoute
                        path="/home"
                        authData={authData}
                        render={(routerProps: RouteComponentProps) => {
                            return (
                                <UserHomeContainer
                                    {...routerProps}
                                    userData={{
                                        username,
                                        id,
                                        courses,
                                        userType,
                                    }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/classes"
                        authData={authData}
                        render={(routerProps: RouteComponentProps) => {
                            return (
                                <ClassesPageContainer
                                    {...routerProps}
                                    userData={{
                                        username,
                                        id,
                                        courses,
                                        userType,
                                    }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/classroom/:classroomId"
                        authData={authData}
                        render={(
                            routerProps: RouteComponentProps<{
                                classroomId: string;
                            }>
                        ) => {
                            return (
                                <ClassroomPageContainer
                                    {...routerProps}
                                    userData={{
                                        username,
                                        id,
                                        courses,
                                        userType,
                                    }}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/room/:roomId"
                        authData={authData}
                        render={(
                            routerProps: RouteComponentProps<{ roomId: string }>
                        ) => {
                            return (
                                <PrivateRoomContainer
                                    {...routerProps}
                                    userData={{
                                        username,
                                        id,
                                        courses,
                                        userType,
                                    }}
                                    roomType={RoomType.PRIVATE}
                                />
                            );
                        }}
                    />
                    <SecuredRoute
                        path="/breakout/:roomId"
                        authData={authData}
                        render={(
                            routerProps: RouteComponentProps<{ roomId: string }>
                        ) => {
                            return (
                                <PrivateRoomContainer
                                    {...routerProps}
                                    userData={{
                                        username,
                                        id,
                                        courses,
                                        userType,
                                    }}
                                    roomType={RoomType.BREAKOUT}
                                />
                            );
                        }}
                    />

                    <SecuredRoute
                        path="/timetable-test"
                        authData={authData}
                        render={(routerProps: RouteComponentProps) => {
                            return <Timetable />;
                        }}
                    />
                </Switch>
            </Container>
        </>
    );
};
