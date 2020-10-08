import React from "react";
import { Container, Row } from "react-bootstrap";
import { UpcomingClassroomSessionData } from "../../types";
import { ClassContainer } from "../classes";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

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
                        data.map((session, i) => {
                            return (
                                <ClassContainer
                                    key={i}
                                    {...session}
                                    size="sm"
                                />
                            );
                        })
                    )}
                </Container>
            </Row>
        </>
    );
};
