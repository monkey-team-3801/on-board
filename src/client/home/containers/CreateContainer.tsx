import React from "react";
import { Button, Col, Container, Jumbotron, Row } from "react-bootstrap";
import { HomeModalType } from "../types";

type Props = {
    showModal: Function;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateContainer = (props: Props) => {
    const { setLoading } = props;

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

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
                                props.showModal(HomeModalType.CLASSROOM);
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
                                props.showModal(HomeModalType.PRIVATE_ROOM);
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
                                props.showModal(HomeModalType.ANNOUNCEMENT);
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
