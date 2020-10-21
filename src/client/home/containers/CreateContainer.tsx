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
        <MDBCardGroup>
            <MDBCol md="12" lg="4">
                <MDBCard>
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
                        >
                            Create a Classroom
                        </MDBBtn>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            <MDBCol md="12" lg="4">
                <MDBCard>
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
                        >
                            Create Private Room
                        </MDBBtn>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            <MDBCol md="12" lg="4">
                <MDBCard>
                    <MDBCardImage
                        className="img-fluid"
                        src="/public/announcement.png"
                        waves
                    />
                    <MDBCardBody>
                        <MDBCardTitle>Annoucements</MDBCardTitle>
                        <MDBCardText>
                            Notify Students and Staff of Important Course
                            Information.
                        </MDBCardText>
                        <MDBBtn
                            onClick={() => {
                                props.showModal(HomeModalType.ANNOUNCEMENT);
                            }}
                            size="sm"
                        >
                            Create Announcement
                        </MDBBtn>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
        </MDBCardGroup>
    );
};
