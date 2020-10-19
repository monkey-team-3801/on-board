import React from "react";
import { Container, Row } from "react-bootstrap";
import { EnrolFormContainer } from "../../courses";
import { TopLayerContainerProps } from "../../types";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";

type Props = TopLayerContainerProps;

export const ProfileSettingsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container className="pt-5">
            <h2>User Details</h2>
            <hr></hr>
            <Row>
                <GeneralOptionsContainer
                    userID={props.userData.id}
                    username={props.userData.username}
                    refreshUserData={async () => props.refreshUserData?.()}
                />
            </Row>
            <h2>Enrolment</h2>
            <hr></hr>
            <p>
                Courses you are enrolled in are displayed below. Use the
                dropdown to add/remove courses.
            </p>
            <Row className="mt-2">
                <EnrolFormContainer
                    coursesResponse={props.coursesResponse}
                    userId={props.userData.id}
                />
            </Row>
        </Container>
    );
};
