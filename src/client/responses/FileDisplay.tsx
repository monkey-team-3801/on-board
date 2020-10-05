import React from "react";
import { FileUploadType, ResponseFormType, RoomType } from "../../types";
import { UploadContainer } from "../filehandler/UploadContainer";
import { useDynamicFetch } from "../hooks";

type Props = {
    formID: string;
    question: string;
    back: () => void;
    userID: string;
    socket: SocketIOClient.Socket;
    sessionID: string;
    formType: ResponseFormType;
};

export const FileDisplay = (props: Props) => {
    const [form] = useDynamicFetch<{ description: string }, { formID: string }>(
        "/response-handler/getFileFormByID",
        { formID: props.formID },
        true
    );

    const [userAnswered] = useDynamicFetch<
        { found: boolean },
        { userID: string; formID: string; formType: ResponseFormType }
    >(
        "/response-handler/checkAnswered",
        {
            userID: props.userID,
            formID: props.formID,
            formType: props.formType,
        },
        true
    );

    return (
        <div>
            <h4>{props.question}</h4>
            {form.data?.description !== "" ? (
                <h1>Description: {form.data?.description}</h1>
            ) : (
                <h1>No description was provided</h1>
            )}
            <hr></hr>
            <UploadContainer
                {...props}
                roomType={RoomType.CLASS}
                uploadType={FileUploadType.RESPONSE}
            ></UploadContainer>
        </div>
    );
};
