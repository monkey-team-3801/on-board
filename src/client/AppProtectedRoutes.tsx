import React from "react";
import { Container } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { RouteComponentProps } from "react-router-dom";
import { ClassEvent } from "../events";
import { UserDataResponseType } from "../types";
import { SecuredRoute } from "./auth/SecuredRoute";
import { ClassesPageContainer } from "./classes";
import { Loader } from "./components";
import { UploadTest } from "./filehandler/UploadTest";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { useFetch, useSocket } from "./hooks";
import { ClassOpenIndicator } from "./Indicators";
import { Navbar } from "./navbar";
import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Timetable } from "./timetable/timetable/Timetable";
import { ClassOpenEventData } from "./types";
import { requestIsLoaded } from "./utils";

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
            <Container fluid>
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
                                    roomType={"private"}
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
                                    roomType={"breakout"}
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
