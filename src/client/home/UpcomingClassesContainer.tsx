import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./Classes.less";
import {
    SessionInfo,
    SessionResponseType,
    SessionRequestType,
    RoomType,
    ClassroomSessionData,
    UpcomingClassroomSessionData,
} from "../../types";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { UpcomingClass } from "./UpcomingClass";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UpcomingClassesContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [classroomsResponse] = useFetch<
        Array<UpcomingClassroomSessionData>,
        {}
    >("session/upcomingClassroomSessions");
    const [data, setData] = React.useState<Array<UpcomingClassroomSessionData>>(
        []
    );

    React.useEffect(() => {
        if (requestIsLoaded(classroomsResponse)) {
            setLoading(false);
            setData(classroomsResponse.data);
        }
    }, [classroomsResponse, setLoading, setData]);

    return (
        <>
            <Row>
                <Container className="classes-list">
                    {data.length === 0 ? (
                        <p className="text-center m-0">
                            You have no upcoming classes, are you enrolled in
                            the right courses?
                        </p>
                    ) : (
                        data.map((session) => {
                            return (
                                <UpcomingClass key={session.id} {...session} />
                            );
                        })
                    )}
                </Container>
            </Row>
        </>
    );
};
