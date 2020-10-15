import React from "react";
import { Container } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { RouteComponentProps } from "react-router-dom";
import { ChatEvent, ClassEvent, RoomEvent } from "../events";
import {
    RoomType,
    UserDataResponseType,
    UserEnrolledCoursesResponseType,
} from "../types";
import { SecuredRoute } from "./auth/SecuredRoute";
import { ChatModal } from "./chat";
import { ClassesPageContainer } from "./classes";
import { Loader } from "./components";
import { ChatModalStatusContext } from "./context";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { useFetch, useSocket } from "./hooks";
import { ClassOpenIndicator } from "./Indicators";
import { socket } from "./io";
import { Navbar } from "./navbar";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Timetable } from "./timetable/timetable/Timetable";
import { ClassOpenEventData } from "./types";
import { ProfilePage } from "./user/ProfilePage";
import { requestIsLoaded } from "./utils";

type Props = RouteComponentProps;

export const AppProtectedRoutes = (props: Props) => {
    const [eventData, setEventData] = React.useState<
        ClassOpenEventData | undefined
    >();

    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");
    const { data } = userDataResponse;

    const [authData] = useFetch<never>("/auth");

    const [chatsWithNewMessageResponse, fetchChatsWithNewMessage] = useFetch<
        Array<string>
    >("/chat/hasNewMessage");

    const [coursesResponse, refreshCourseData] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

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

    const onChatStatusChange = React.useCallback(
        (targetUserId?: string) => {
            if (id === targetUserId) {
                fetchChatsWithNewMessage();
            }
        },
        [id, fetchChatsWithNewMessage]
    );

    React.useEffect(() => {
        if (id) {
            socket.on(ChatEvent.CHAT_STATUS_CHANGE, onChatStatusChange);
        }
        return () => {
            socket.off(ChatEvent.CHAT_STATUS_CHANGE, onChatStatusChange);
        };
    }, [id, onChatStatusChange]);

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
            <Navbar
                {...props}
                username={data?.username}
                userid={data?.id}
                newMessages={chatsWithNewMessageResponse.data?.length}
            />
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
                            chatWithNewMessages={
                                chatsWithNewMessageResponse.data || []
                            }
                            courses={coursesResponse.data?.courses || []}
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
                                        userType,
                                    }}
                                    coursesResponse={coursesResponse}
                                    refreshCourses={refreshCourseData}
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
                                        userType,
                                    }}
                                    coursesResponse={coursesResponse}
                                    refreshCourses={refreshCourseData}
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
                                        userType,
                                    }}
                                    coursesResponse={coursesResponse}
                                    refreshCourses={refreshCourseData}
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
                                        userType,
                                    }}
                                    roomType={RoomType.PRIVATE}
                                    coursesResponse={coursesResponse}
                                    refreshCourses={refreshCourseData}
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
                                        userType,
                                    }}
                                    roomType={RoomType.BREAKOUT}
                                    coursesResponse={coursesResponse}
                                    refreshCourses={refreshCourseData}
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

                    <SecuredRoute
                        path="/profile"
                        authData={authData}
                        render={(routerProps: RouteComponentProps) => {
                            return <ProfilePage userID={id} />;
                        }}
                    />
                </Switch>
            </Container>
        </>
    );
};
