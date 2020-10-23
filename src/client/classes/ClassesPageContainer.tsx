import React from "react";
import { Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { UserEnrolledCoursesResponseType } from "../../types";
import { ContainerWrapper } from "../components";
import { useFetch } from "../hooks";
import { TopLayerContainerProps } from "../types";
import { ClassroomDisplayContainer } from "./ClassroomDisplayContainer";
import { PrivateRoomDisplayContainer } from "./PrivateRoomDisplayContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const ClassesPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [courseData] = useFetch<UserEnrolledCoursesResponseType>(
        "/user/courses"
    );

    return (
        <div className="classes-page">
            <Row>
                <Col xs="12">
                    <Row>
                        <ContainerWrapper title="Classrooms">
                            {(setLoading) => {
                                return (
                                    <ClassroomDisplayContainer
                                        {...props}
                                        setLoading={setLoading}
                                        courses={courseData.data?.courses || []}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Private rooms">
                            {(setLoading) => {
                                return (
                                    <PrivateRoomDisplayContainer
                                        {...props}
                                        setLoading={setLoading}
                                        courses={courseData.data?.courses || []}
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
