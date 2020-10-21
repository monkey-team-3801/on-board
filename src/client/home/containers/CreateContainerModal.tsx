import React from "react";
import { Button, Modal } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnnouncementsForm } from "../../announcements";
import { ContainerWrapper } from "../../components";
import {
    CreateClassroomContainer,
    CreatePrivateRoomContainer,
} from "../../rooms";

type Props = RouteComponentProps & {
    closeModal: Function;
    refreshKeyValue: number;
    showModal: boolean;
    modalContent: number;
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
                    {modalContent === 0 && (
                        <ContainerWrapper>
                            {(setLoading) => {
                                return (
                                    <CreateClassroomContainer
                                        setLoading={setLoading}
                                        refreshKey={props.refreshKeyValue}
                                        courses={props.courses || []}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    )}
                    {modalContent === 1 && (
                        <ContainerWrapper>
                            {(setLoading) => {
                                return (
                                    <CreatePrivateRoomContainer
                                        setLoading={setLoading}
                                        refreshKey={props.refreshKeyValue}
                                        {...props}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    )}
                    {modalContent === 2 && (
                        <ContainerWrapper>
                            {(setLoading) => {
                                return (
                                    <CreateAnnouncementsForm
                                        userId={props.userId}
                                        setLoading={setLoading}
                                        refreshKey={props.refreshKeyValue}
                                        courses={props.courses || []}
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
