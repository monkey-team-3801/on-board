import React from "react";
import Switch from "react-bootstrap/esm/Switch";

import { ClassroomPageContainer } from "./rooms/ClassroomPageContainer";
import { PrivateRoomContainer } from "./rooms/PrivateRoomContainer";
import { Calendar } from "./timetable/Calendar";
import { SecuredRoute } from "./auth/SecuredRoute";
import { UserHomeContainer } from "./home/UserHomeContainer";
import { UserDataResponseType } from "../types";
import { useFetch } from "./hooks";
import { requestIsLoaded } from "./utils";
import { RouteComponentProps } from "react-router-dom";
import { UploadTest } from "./filehandler/UploadTest";

type Props = RouteComponentProps;

export const AppProtectedRoutes = (props: Props) => {
    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");
    const { data } = userDataResponse;

    const userData = React.useMemo(() => {
        return {
            username: data?.username,
            id: data?.id,
            courses: data?.courses,
        };
    }, [data]);

    const { username, id, courses } = userData;

    if (!requestIsLoaded(userDataResponse)) {
        return <div>Loading</div>;
    }

    if (!username || !id || !courses) {
        props.history.push("/");
        return <></>;
    }

    return (
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
                path="/classroom/:classroomId"
                render={(
                    routerProps: RouteComponentProps<{ classroomId: string }>
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
    );
};
