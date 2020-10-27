import React from "react";
import { Button, Modal } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnnouncementsForm } from "../../announcements";
import { ContainerWrapper } from "../../components";
import {
    CreateClassroomContainer,
    CreatePrivateRoomContainer,
} from "../../rooms";
import { HomeModalType } from "../types";

type Props = RouteComponentProps & {
    // Callback to close the modal.
    closeModal: Function;
    // Refresh key for forcing refreshing components.
    refreshKey: number;
    // Modal visible flag.
    showModal: boolean;
    // Content inside the modal.
    modalContent: HomeModalType;
    // List of courses the user is enrolled in.
    courses: Array<string>;
    // Current user id.
    userId: string;
};

/**
 * Modal containing tools to create classes or announcements.
 */
export const CreateContainerModal = (props: Props) => {
    const { closeModal, showModal, modalContent } = props;

    return (
        <div>
            <Modal
                show={showModal}
                onHide={() => {
                    closeModal();
                }}
                size="xl"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalContent === HomeModalType.CLASSROOM &&
                            "Create Classroom"}
                        {modalContent === HomeModalType.PRIVATE_ROOM &&
                            "Create Private Room"}
                        {modalContent === HomeModalType.ANNOUNCEMENT &&
                            "Create Announcement"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalContent === HomeModalType.CLASSROOM && (
                        <ContainerWrapper noShadow>
                            {(setLoading) => {
                                return (
                                    <CreateClassroomContainer
                                        setLoading={setLoading}
                                        courses={props.courses || []}
                                        refreshKey={props.refreshKey}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    )}
                    {modalContent === HomeModalType.PRIVATE_ROOM && (
                        <ContainerWrapper noShadow>
                            {(setLoading) => {
                                return (
                                    <CreatePrivateRoomContainer
                                        setLoading={setLoading}
                                        {...props}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    )}
                    {modalContent === HomeModalType.ANNOUNCEMENT && (
                        <ContainerWrapper noShadow>
                            {(setLoading) => {
                                return (
                                    <CreateAnnouncementsForm
                                        userId={props.userId}
                                        setLoading={setLoading}
                                        courses={props.courses || []}
                                        refreshKey={props.refreshKey}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            closeModal();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
