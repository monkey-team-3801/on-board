import React from "react";
import { Col, Container, Nav, NavItem, Row } from "react-bootstrap";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";
import { ProfileSettingsBanner } from "./ProfileSettingsBanner";

type Props = {
    userID: string;
    username: string;
};

export const ProfileSettings: React.FunctionComponent<Props> = (
    props: Props
) => {
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
                        <ProfileSettingsBanner
                            {...props}
                        ></ProfileSettingsBanner>
                    </Row>
                    <Row>
                        <GeneralOptionsContainer />
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
