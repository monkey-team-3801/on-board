import { format } from "date-fns";
import React, { useMemo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import FadeIn from "react-fade-in";
import { CourseActivityResponseType } from "../../../types";
import { Event } from "./Event";

type Props = {
    chosenDate: Date;
    getRelevantActivities: (chosenDate: Date) => CourseActivityResponseType;
};

export const UpcomingEventsContainer: React.FunctionComponent<Props> = ({
    chosenDate,
    getRelevantActivities,
}) => {
    const relevantActivities = useMemo(
        () => getRelevantActivities(chosenDate),
        [getRelevantActivities, chosenDate]
    );
    return (
        <Container className="upcoming-events mt-4">
            <Row>
                <header>
                    <h1>Events on {format(chosenDate, "d MMM yyyy")}</h1>
                </header>
                <hr className="my-2 peach-gradient" />
            </Row>
            {Object.values(relevantActivities).some(
                (arr) => arr.length !== 0
            ) ? (
                <Row className="events-container">
                    <Col>
                        <FadeIn delay={100}>
                            {Object.entries(
                                relevantActivities
                            ).map(([courseCode, activities], i) =>
                                activities.map((activity, j) => (
                                    <Event
                                        courseCode={courseCode}
                                        activity={activity}
                                        key={`${i}${j}`}
                                    />
                                ))
                            )}
                        </FadeIn>
                    </Col>
                </Row>
            ) : (
                <p className="text-muted text-center p-3">No events today</p>
            )}
        </Container>
    );
};

