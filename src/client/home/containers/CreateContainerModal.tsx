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
    closeModal: Function;
    refreshKey: number;
    showModal: boolean;
    modalContent: HomeModalType;
    courses: Array<string>;
    userId: string;
};

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
                    <Modal.Title>Create</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalContent === HomeModalType.CLASSROOM && (
                        <ContainerWrapper>
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
                        <ContainerWrapper>
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
                        <ContainerWrapper>
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
