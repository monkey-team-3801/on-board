import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { EnrolmentOptionsContainer } from "./EnrolmentOptionsContainer";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";

type Props = {
    userID: string;
    username: string;
};

export const ProfileSettingsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container fluid>
            <Row style={{ paddingTop: "2%" }}>
                <Col xs={5}>
                    <h2>User Details</h2>
                    <hr></hr>
                    <Row>
                        <GeneralOptionsContainer {...props} />
                    </Row>
                </Col>

                <Col>
                    <h2>Enrolment</h2>
                    <hr></hr>
                    <EnrolmentOptionsContainer {...props} />
                </Col>
            </Row>
        </Container>
    );
};
