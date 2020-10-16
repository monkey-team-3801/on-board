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
                    <Row>
                        <GeneralOptionsContainer {...props} />
                    </Row>
                </Col>
                <Col>
                    <EnrolmentOptionsContainer />
                </Col>
            </Row>
        </Container>
    );
};
