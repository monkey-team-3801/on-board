import {
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardGroup,
    MDBCardImage,
    MDBCardText,
    MDBCardTitle,
    MDBCol,
} from "mdbreact";
import React from "react";
import { HomeModalType } from "../types";
import { isStaff } from "../../utils";
import { UserType } from "../../../types";

type Props = {
    showModal: Function;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userType: UserType;
};

export const CreateContainer = (props: Props) => {
    const { setLoading } = props;

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    return (
        <MDBCardGroup>
            {isStaff(props.userType) && (
                <MDBCol md="12" lg="4">
                    <MDBCard className="card-internal">
                        <MDBCardImage
                            className="img-fluid"
                            src="/public/classroom.jpg"
                            waves
                        />
                        <MDBCardBody>
                            <MDBCardTitle>Classrooms</MDBCardTitle>
                            <MDBCardText>
                                Large, collaborative rooms for lectures and
                                presentations.
                            </MDBCardText>
                            <MDBBtn
                                onClick={() => {
                                    props.showModal(HomeModalType.CLASSROOM);
                                }}
                                size="sm"
                                className="peach-gradient ml-0 mt-2"
                            >
                                Create a Classroom
                            </MDBBtn>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            )}
            <MDBCol md="12" lg="4">
                <MDBCard className="card-internal">
                    <MDBCardImage
                        className="img-fluid"
                        src="/public/privateroom.png"
                        waves
                    />
                    <MDBCardBody>
                        <MDBCardTitle>Private Rooms</MDBCardTitle>
                        <MDBCardText>
                            Smaller rooms ideal for tutorials and meetings.
                        </MDBCardText>
                        <MDBBtn
                            onClick={() => {
                                props.showModal(HomeModalType.PRIVATE_ROOM);
                            }}
                            size="sm"
                            className="peach-gradient ml-0 mt-2"
                        >
                            Create Private Room
                        </MDBBtn>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            {isStaff(props.userType) && (
                <MDBCol md="12" lg="4">
                    <MDBCard className="card-internal">
                        <MDBCardImage
                            className="img-fluid"
                            src="/public/announcement.png"
                            waves
                        />
                        <MDBCardBody>
                            <MDBCardTitle>Annoucements</MDBCardTitle>
                            <MDBCardText>
                                Notify students and staff of important course
                                information.
                            </MDBCardText>
                            <MDBBtn
                                onClick={() => {
                                    props.showModal(HomeModalType.ANNOUNCEMENT);
                                }}
                                size="sm"
                                className="peach-gradient ml-0 mt-2"
                            >
                                Create Announcement
                            </MDBBtn>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            )}
        </MDBCardGroup>
    );
};
