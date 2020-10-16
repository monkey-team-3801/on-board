import React from "react";
import { Col, Container, Nav, NavItem, Row } from "react-bootstrap";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";
import { AvatarSettings } from "./AvatarSettings";

type Props = {
    userID: string;
    username: string;
};

export const ProfileSettingsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [navState, setNavState] = React.useState<number>(0);

    return (
        <Container fluid>
            <Row>
                <h1>Settings</h1>
            </Row>
            <Row>
                <Col xs={2}>
                    <Nav variant="pills">
                        <NavItem
                            className="flex-column"
                            style={{ width: "100%" }}
                        >
                            <Nav.Link
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
                                Avatar
                            </Nav.Link>
                            <Nav.Link
                                active={navState === 2}
                                onClick={() => {
                                    setNavState(2);
                                }}
                            >
                                Enrolment
                            </Nav.Link>
                            <Nav.Link
                                active={navState === 3}
                                onClick={() => {
                                    setNavState(3);
                                }}
                            >
                                Account
                            </Nav.Link>
                        </NavItem>
                    </Nav>
                </Col>
                <Col>
                    <Row>
                        <Col xs={8}>
                            <GeneralOptionsContainer {...props} />
                        </Col>
                        <Col xs={1}>
                            <AvatarSettings {...props} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
