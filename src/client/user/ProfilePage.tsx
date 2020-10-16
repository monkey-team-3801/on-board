import React from "react";
import { Col, Container, Nav, NavItem, Row } from "react-bootstrap";
import { ProfileOptionsContainer } from "./ProfileOptionsContainer";
import { ProfilePictureContainer } from "./ProfilePictureContainer";

type Props = {
    userID: string;
};

export const ProfilePage: React.FunctionComponent<Props> = (props: Props) => {
    const [navState, setNavState] = React.useState<number>(0);

    return (
        <Container fluid>
            <Row>
                <h1>Settings</h1>
            </Row>
            <Row>
                <Col>
                    <Nav variant="pills" defaultActiveKey="general">
                        <NavItem className="flex-column">
                            <Nav.Link
                                eventKey="general"
                                active={navState === 0}
                                onClick={() => {
                                    setNavState(0);
                                }}
                            >
                                General
                            </Nav.Link>
                            <Nav.Link
                                active={navState === 1}
                                onClick={() => {
                                    setNavState(1);
                                }}
                            >
                                Enrolment
                            </Nav.Link>
                            <Nav.Link
                                active={navState === 2}
                                onClick={() => {
                                    setNavState(2);
                                }}
                            >
                                Account
                            </Nav.Link>
                        </NavItem>
                    </Nav>
                </Col>
                <Col>
                    <Row>
                        <Col>
                            <ProfileOptionsContainer />
                        </Col>
                        <Col>
                            <ProfilePictureContainer userId={props.userID} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
