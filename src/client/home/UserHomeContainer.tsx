import React from "react";
import { Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { AnnouncementEvent } from "../../events";
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { ContainerWrapper } from "../components";
import { EnrolFormContainer } from "../courses";
import { useSocket } from "../hooks";
import { CreateClassroomContainer } from "../rooms";
import { CreatePrivateRoomContainer } from "../rooms/CreatePrivateRoomContainer";
import { Calendar } from "../timetable";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { UserInfoContainer } from "./containers";
import "./Homepage.less";
import { UpcomingClassesContainer } from "./UpcomingClassesContainer";

type Props = RouteComponentProps &
    TopLayerContainerProps & {
        onlineUsers: Array<string>;
    };

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData, coursesResponse, refreshCourses } = props;

    const [refreshKey, setRefreshKey] = React.useState<number>(0);

    const announcementSubscribe = React.useCallback(
        (socket: SocketIOClient.Socket, courses: Array<string>) => {
            return socket.emit(
                AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
                {
                    courses,
                }
            );
        },
        []
    );

    const { socket } = useSocket(
        AnnouncementEvent.NEW,
        undefined,
        undefined,
        () => {
            setRefreshKey((k) => {
                return k + 1;
            });
        }
    );

    React.useEffect(() => {
        if (requestIsLoaded(coursesResponse)) {
            announcementSubscribe(socket, coursesResponse.data.courses);
        }
    }, [announcementSubscribe, coursesResponse, socket]);

    const refreshAnnouncements = React.useCallback(() => {
        setRefreshKey((k) => {
            return k + 1;
        });
        refreshCourses?.();
    }, [refreshCourses]);

    return (
        <div className="homepage">
            <Row>
                <Col xl="6" lg="6" md="12">
                    <Row>
                        <ContainerWrapper className="calendar" title="Calendar">
                            {(setLoading) => {
                                return (
                                    <Calendar
                                        setLoading={setLoading}
                                        sessions={[]}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper
                            className="classes-container"
                            title="Classes"
                        >
                            {(setLoading) => {
                                return (
                                    <UpcomingClassesContainer
                                        setLoading={setLoading}
                                        userId={props.userData.id}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Create Private Room">
                            {(setLoading) => {
                                return (
                                    <CreatePrivateRoomContainer
                                        setLoading={setLoading}
                                        refreshKey={refreshKey}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                        {...props}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Create Classroom">
                            {(setLoading) => {
                                return (
                                    <CreateClassroomContainer
                                        setLoading={setLoading}
                                        refreshKey={refreshKey}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                </Col>
                <Col xl="6" lg="6" md="12">
                    <Row>
                        <ContainerWrapper
                            className="user-info-container"
                            title="Your Profile"
                        >
                            {(setLoading) => {
                                return (
                                    <UserInfoContainer
                                        setLoading={setLoading}
                                        coursesResponse={coursesResponse}
                                        onlineUsers={props.onlineUsers}
                                        {...props.userData}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper
                            className="announcements-container"
                            title="Announcements"
                        >
                            {(setLoading) => {
                                return (
                                    <AnnouncementsContainer
                                        refreshKey={refreshKey}
                                        userId={userData.id}
                                        setLoading={setLoading}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Course Enrolment">
                            {(setLoading) => {
                                return (
                                    <EnrolFormContainer
                                        setLoading={setLoading}
                                        refresh={refreshAnnouncements}
                                        userId={userData.id}
                                        socket={socket}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Create Announcements">
                            {(setLoading) => {
                                return (
                                    <CreateAnnouncementsForm
                                        userId={userData.id}
                                        setLoading={setLoading}
                                        refreshKey={refreshKey}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};
