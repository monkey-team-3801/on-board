import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { CreateBreakoutRoomForm } from "./CreateBreakoutRoomForm";
import { useDynamicFetch } from "../../hooks";
import { BreakoutRoomAllocationContainer } from "../containers/";
import { UserDataResponseType } from "../../../types";

type Props = {
    visible: boolean;
    sessionId: string;
    handleClose: () => void;
    userData: Array<Omit<UserDataResponseType, "courses">>;
};

export const BreakoutRoomModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { visible, handleClose } = props;

    const [createBreakoutRoomsResponse, createBreakoutRooms] = useDynamicFetch<
        undefined,
        { amount: number; sessionId: string }
    >("/session/createBreakoutRooms", undefined, false);

    const [creationStage, setCreationStage] = React.useState<number>(0);

    const [roomAmount, setRoomAmount] = React.useState<number>(1);

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Breakout Rooms Management</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {creationStage === 0 && (
                    <CreateBreakoutRoomForm
                        onCreate={(amount) => {
                            setRoomAmount(amount);
                            setCreationStage(1);
                            // createBreakoutRooms({
                            //     amount,
                            //     sessionId: props.sessionId,
                            // });
                        }}
                    />
                )}
                {creationStage === 1 && (
                    <BreakoutRoomAllocationContainer
                        amount={roomAmount}
                        users={props.userData}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
