import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch } from "../hooks";
import { ChatContainer } from "../chat";
import { requestIsLoaded } from "../utils";
import { UserDataResponseType, FileUploadType } from "../../types";
import { TopLayerContainerProps } from "../types";
import { FileContainer } from "../filehandler/FileContainer";
import { UploadContainer } from "../filehandler/UploadContainer";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {};

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");

    const [sessionResponse] = useFetch<any, any>("/session/getSession", {
        id: props.match.params.roomId,
    });

    if (
        !requestIsLoaded(sessionResponse) ||
        !requestIsLoaded(userDataResponse)
    ) {
        return <div>Loading</div>;
    }

    return (
        <Container>
            <Row>
                <h1>Private Room</h1>
            </Row>
            <Row>
                <Col>
                    <p>Room ID: {props.match.params.roomId}</p>
                </Col>
                <Col>
                    <Button
                        size="sm"
                        variant="light"
                        onClick={() => {
                            props.history.push("/home");
                        }}
                    >
                        Back
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ChatContainer
                        roomId={props.match.params.roomId}
                        username={userDataResponse.data?.username}
                        initialChatLog={sessionResponse.data.messages}
                    />
                </Col>
                <Col>
                    <Row>
                        <FileContainer
                            sessionID={props.match.params.roomId}
                        ></FileContainer>
                    </Row>
                    <Row>
                        <UploadContainer
                            uploadType={FileUploadType.DOCUMENTS}
                            sessionID={props.match.params.roomId}
                        ></UploadContainer>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
