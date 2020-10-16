import React from "react";
import { Container, Row } from "react-bootstrap";
import { ContainerWrapper } from "../../components";
import { EnrolFormContainer } from "../../courses";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";

type Props = {
    userID: string;
    username: string;
};

export const ProfileSettingsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container style={{ paddingTop: "2%" }}>
            <h2>User Details</h2>
            <hr></hr>
            <Row>
                <GeneralOptionsContainer {...props} />
            </Row>
            <h2>Enrolment</h2>
            <hr></hr>
            <h6>
                Courses you are enrolled in are displayed below. Use the
                dropdown to add/remove courses.
            </h6>
            <Row>
                <ContainerWrapper>
                    {(setLoading) => {
                        return (
                            <EnrolFormContainer
                                userId={props.userID}
                                setLoading={setLoading}
                            />
                        );
                    }}
                </ContainerWrapper>
            </Row>
        </Container>
    );
};
