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
import { CreateRoomForm } from "../rooms/CreateRoomForm";
import { Calendar } from "../timetable";
import { TopLayerContainerProps } from "../types";
import "./Homepage.less";
import { UpcomingClassesContainer } from "./UpcomingClassesContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData } = props;
    const { courses } = userData;

    const [refreshKey, setRefreshKey] = React.useState<number>(0);

    const componentDidMount = React.useCallback(
        (socket: SocketIOClient.Socket) => {
            return socket.emit(
                AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
                {
                    courses,
                }
            );
        },
        [courses]
    );

    const { socket } = useSocket(
        AnnouncementEvent.NEW,
        undefined,
        componentDidMount,
        () => {
            setRefreshKey((k) => {
                return k + 1;
            });
        }
    );

    const refreshAnnouncements = React.useCallback(() => {
        setRefreshKey((k) => {
            return k + 1;
        });
    }, []);

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
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Create Private Room">
                            {(setLoading) => {
                                return (
                                    <CreateRoomForm
                                        setLoading={setLoading}
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
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                </Col>
                <Col xl="6" lg="6" md="12">
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
