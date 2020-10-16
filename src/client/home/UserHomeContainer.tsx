import React from "react";
import { Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { ContainerWrapper } from "../components";
import { CreateClassroomContainer } from "../rooms";
import { CreatePrivateRoomContainer } from "../rooms/CreatePrivateRoomContainer";
import { Calendar } from "../timetable";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import "./Homepage.less";
import { UpcomingClassesContainer } from "./UpcomingClassesContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData, coursesResponse } = props;

    const [refreshKey] = React.useState<number>(0);

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
