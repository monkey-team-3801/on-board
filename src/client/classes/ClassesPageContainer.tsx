import React from "react";
import { Row, Col } from "react-bootstrap";
import { ContainerWrapper } from "../components";
import { ClassroomDisplayContainer } from "./ClassroomDisplayContainer";
import { useFetch, useDynamicFetch } from "../hooks";
import {
    RoomType,
    SessionDeleteRequestType,
    SessionRequestType,
    SessionResponseType,
} from "../../types";
import { TopLayerContainerProps } from "../types";
import { RouteComponentProps } from "react-router-dom";
import { PrivateRoomDisplayContainer } from "./PrivateRoomDisplayContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const ClassesPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { history, userData } = props;

    const [, deleteRoom] = useDynamicFetch<undefined, SessionDeleteRequestType>(
        "session/delete",
        undefined,
        false
    );

    const onPrivateRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
        },
        [history]
    );

    const onClassroomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/classroom/${id}`);
        },
        [history]
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
