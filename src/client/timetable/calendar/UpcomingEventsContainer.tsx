import React, { useMemo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { format } from "date-fns";
import { CourseActivityResponseType } from "../../../types";
import { Loader } from "../../components";

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
                    <h1>Classes on {format(chosenDate, "d MMM yyyy")}</h1>
                </header>
                <hr className="my-2 peach-gradient" />
            </Row>
            {Object.values(relevantActivities).some(
                (arr) => arr.length !== 0
            ) ? (
                <Row className="events-container">
                    <Col>
                        {Object.entries(relevantActivities).map(
                            ([courseCode, activities]) => (
                                <Row key={courseCode}>
                                    <h2>{courseCode}</h2>
                                    <ul>
                                        {activities.map((activity) => (
                                            <li
                                                key={
                                                    activity.type +
                                                    activity.code
                                                }
                                            >
                                                {activity.type + activity.code}{" "}
                                                from {activity.time} to{" "}
                                                {activity.time +
                                                    activity.duration / 60}
                                            </li>
                                        ))}
                                    </ul>
                                </Row>
                            )
                        )}
                    </Col>
                </Row>
            ) : (
                <Loader full />
            )}
        </Container>
    );
};

//// Just comment here so it can be reused.
// const Event = () => {
//     return (
//         <Card className="event my-2">
//             <Card.Header className="peach-gradient">Event</Card.Header>
//             <Card.Body>
//                 <Card.Title>Assignment Due</Card.Title>
//                 <Card.Subtitle className="mb-2 text-muted">
//                     {new Date().toDateString()}
//                 </Card.Subtitle>
//                 <Card.Text>
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
//                     do eiusmod tempor incididunt ut labore et dolore magna
//                     aliqua. Ut enim ad minim veniam, quis nostrud exercitation
//                     ullamco laboris nisi ut aliquip ex ea commodo consequat.
//                     Duis aute irure dolor in reprehenderit in voluptate velit
//                     esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
//                     occaecat cupidatat non proident, sunt in culpa qui officia
//                     deserunt mollit anim id est laborum.
//                 </Card.Text>
//             </Card.Body>
//         </Card>
//     );
// };
