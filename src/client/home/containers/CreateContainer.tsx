import React from "react";
import { Button, Col, Container, Jumbotron, Row } from "react-bootstrap";

type Props = {
    showModal: Function;
};

export const CreateContainer = (props: Props) => {
    return (
        <Container>
            <Row>
                <Col>
                    <Jumbotron>
                        <h1>Classrooms</h1>
                        <p>
                            Large, collabrative rooms for lectures and
                            presentations.
                        </p>
                        <Button
                            onClick={() => {
                                props.showModal(0);
                            }}
                        >
                            Create a New Classroom
                        </Button>
                    </Jumbotron>
                </Col>
                <Col>
                    <Jumbotron>
                        <h1>Private Rooms</h1>
                        <p>Smaller rooms ideal for tutorials and meetings.</p>
                        <Button
                            onClick={() => {
                                props.showModal(1);
                            }}
                        >
                            Create a New Private Room
                        </Button>
                    </Jumbotron>
                </Col>
                <Col>
                    <Jumbotron>
                        <h1>Announcements</h1>
                        <p>Notify others of important course information.</p>
                        <Button
                            onClick={() => {
                                props.showModal(2);
                            }}
                        >
                            Create an Announcement
                        </Button>
                    </Jumbotron>
                </Col>
            </Row>
        </Container>
    );
};
