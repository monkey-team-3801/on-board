import React from "react";
import { Container, Row } from "react-bootstrap";
import { ContainerWrapper } from "../../components";
import { EnrolFormContainer } from "../../courses";
import { GeneralOptionsContainer } from "./GeneralOptionsContainer";
import { TopLayerContainerProps } from "../../types";

type Props = TopLayerContainerProps;

export const ProfileSettingsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container style={{ paddingTop: "2%" }}>
            <h2>User Details</h2>
            <hr></hr>
            <Row>
                <GeneralOptionsContainer
                    userID={props.userData.id}
                    username={props.userData.username}
                />
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
                                coursesResponse={props.coursesResponse}
                                userId={props.userData.id}
                                setLoading={setLoading}
                                refreshCourses={async () => await props.refreshCourses?.()}
                            />
                        );
                    }}
                </ContainerWrapper>
            </Row>
        </Container>
    );
};
