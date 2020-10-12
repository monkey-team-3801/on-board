import React from "react";
import { Container, Row } from "react-bootstrap";

type Props = {
    chosenMonth: number;
    chosenYear: number;
};

export const UpcomingEventsContainer: React.FunctionComponent<Props> = ({
    chosenMonth,
    chosenYear,
}) => {
    return (
        <Container className="upcoming-events">
            <Row>
                <header>
                    <h1>{new Date().toDateString()}</h1>
                </header>
            </Row>
            <Row>
                <Container className="events-container">
                    <Event />
                    <Event />
                    <Event />
                    <Event />
                    <Event />
                </Container>
            </Row>
        </Container>
    );
};

const Event = () => {
    return (
        <Container className="event">
            <Row>
                <hr
                    style={{
                        borderTopColor: `#${Math.floor(Math.random() * 16777215)
                            .toString(16)
                            .toString()}`,
                    }}
                />
            </Row>
            <Row>
                <p>In xxx Hours</p>
            </Row>
            <Row>
                <p>12AM - 12PM</p>
            </Row>
            <Row>
                <p>Description</p>
            </Row>
        </Container>
    );
};
