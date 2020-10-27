import React from "react";
import { Container, Row } from "react-bootstrap";
import { RoomType, UpcomingClassroomSessionData } from "../../types";
import { ClassContainer } from "../classes";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    // Setter for the loading state.
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // Sets the amount of upcoming classes, used for the notifications list.
    setUpcomingClassesAmount: React.Dispatch<React.SetStateAction<number>>;
    // Current user id.
    userId: string;
};

/**
 * Container rendering an list of upcoming classes.
 */
export const UpcomingClassesContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, setUpcomingClassesAmount } = props;
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
            setUpcomingClassesAmount(classroomsResponse.data.length);
        }
    }, [classroomsResponse, setLoading, setData, setUpcomingClassesAmount]);

    return (
        <>
            <Row>
                <Container className="classes-list">
                    {data.length === 0 ? (
                        <p className="text-center m-0 text-muted">
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
                                    type={RoomType.CLASS}
                                    currentUserId={props.userId}
                                />
                            );
                        })
                    )}
                </Container>
            </Row>
        </>
    );
};
