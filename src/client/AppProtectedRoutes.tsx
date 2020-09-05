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

type Props = RouteComponentProps;

export const AppProtectedRoutes = (props: Props) => {
    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");
    const { data } = userDataResponse;

    const userData: { username?: string; id?: string } = React.useMemo(() => {
        return {
            username: data?.username,
            id: data?.id,
        };
    }, [data]);

    const { username, id } = userData;

    if (!requestIsLoaded(userDataResponse)) {
        return <div>Loading</div>;
    }

    if (!username || !id) {
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
                            userData={{ username, id } as any}
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
                            userData={{ username, id }}
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
                            userData={{ username, id }}
                        />
                    );
                }}
            />
            <SecuredRoute path="/calendar-test" component={Calendar} />
        </Switch>
    );
};
