import React from "react";
import { Container } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { RouteComponentProps } from "react-router-dom";
import { ClassEvent } from "../events";
import { UserDataResponseType } from "../types";
import { SecuredRoute } from "./auth/SecuredRoute";
import { ClassesPageContainer } from "./classes";
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
        return <div>Loading</div>;
    }

    if (!username || !id || !courses || userType === undefined) {
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
                </Switch>
            </Container>
        </>
    );
};
