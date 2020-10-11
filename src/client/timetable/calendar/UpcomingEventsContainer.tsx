import React from "react";
import { Card, Container, Row } from "react-bootstrap";

export const UpcomingEventsContainer = () => {
    return (
        <Container className="upcoming-events mt-4">
            <Row>
                <header>
                    <h1>Upcoming Events</h1>
                </header>
                <hr className="my-2 peach-gradient" />
            </Row>
            <Row className="events-container">
                <Event />
                <Event />
                <Event />
            </Row>
        </Container>
    );
};

const Event = () => {
    return (
        <Card className="event my-2">
            <Card.Header className="peach-gradient">Event</Card.Header>
            <Card.Body>
                <Card.Title>Assignment Due</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {new Date().toDateString()}
                </Card.Subtitle>
                <Card.Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </Card.Text>
            </Card.Body>
        </Card>
    );
};
