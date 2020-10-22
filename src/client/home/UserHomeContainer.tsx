import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { AnnouncementEvent } from "../../events";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { ContainerWrapper } from "../components";
import { useSocket } from "../hooks";
import { Calendar } from "../timetable";
import { TopLayerContainerProps } from "../types";
import { isStaff } from "../utils";
import { UserInfoContainer } from "./containers";
import { CreateContainer } from "./containers/CreateContainer";
import { CreateContainerModal } from "./containers/CreateContainerModal";
import "./Homepage.less";
import { HomeModalType } from "./types";
import { UpcomingClassesContainer } from "./UpcomingClassesContainer";
import { UserHeaderJumbotron } from "./UserHeaderJumbotron";

type Props = RouteComponentProps &
    TopLayerContainerProps & {
        onlineUsers: Array<string>;
        newMessages?: number;
    };

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData, coursesResponse } = props;

    const [upcomingClassesAmount, setUpcomingClassesAmount] = React.useState<
        number
    >(0);

    // TODO Set this when Mike is ready.
    const [eventsAmount] = React.useState<number>(0);

    useSocket(AnnouncementEvent.NEW, undefined, undefined, () => {
        setRefreshKey((k) => {
            return k + 1;
        });
    });

    const [refreshKey, setRefreshKey] = React.useState<number>(0);

    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [modalContent, setModalContent] = React.useState<HomeModalType>(
        HomeModalType.CLASSROOM
    );

    const handleShowModal = (content: number) => {
        setShowModal(true);
        setModalContent(content);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    return (
        <div className="homepage">
            <Container fluid>
                <Row>
                    <Col className="p-0">
                        <UserHeaderJumbotron
                            {...props}
                            username={props.userData.username}
                            newMessagesAmount={props.newMessages ?? 0}
                            upcomingClassesAmount={upcomingClassesAmount}
                            eventsAmount={eventsAmount}
                        />
                    </Col>
                </Row>
            </Container>
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
                                        setUpcomingClassesAmount={
                                            setUpcomingClassesAmount
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>

                    <Row></Row>
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
                                        {...props}
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
                                        onlineUsers={props.onlineUsers}
                                        courses={
                                            coursesResponse.data?.courses || []
                                        }
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        {
                            <ContainerWrapper
                                title={
                                    isStaff(userData.userType)
                                        ? "Staff Tools"
                                        : "Tools"
                                }
                            >
                                {(setLoading) => {
                                    return (
                                        <CreateContainer
                                            showModal={handleShowModal}
                                            setLoading={setLoading}
                                            userType={userData.userType}
                                        />
                                    );
                                }}
                            </ContainerWrapper>
                        }
                    </Row>
                </Col>
            </Row>
            <CreateContainerModal
                refreshKey={refreshKey}
                userId={userData.id}
                courses={coursesResponse.data?.courses || []}
                closeModal={handleCloseModal}
                showModal={showModal}
                modalContent={modalContent}
                {...props}
            />
        </div>
    );
};
