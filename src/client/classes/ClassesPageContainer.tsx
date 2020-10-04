import React from "react";
import { Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { ContainerWrapper } from "../components";
import { TopLayerContainerProps } from "../types";
import { ClassroomDisplayContainer } from "./ClassroomDisplayContainer";
import { PrivateRoomDisplayContainer } from "./PrivateRoomDisplayContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const ClassesPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
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
