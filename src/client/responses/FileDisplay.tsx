import React from "react";
import Button from "react-bootstrap/esm/Button";
import { FileUploadType, ResponseFormType, RoomType } from "../../types";
import { Loader } from "../components";
import { UploadContainer } from "../filehandler/UploadContainer";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    // Current form id.
    formID: string;
    // Title of the question.
    question: string;
    // Method to go back to the previous view.
    back: () => void;
    // Current user id;
    userID: string;
    // Session socket instance.
    socket: SocketIOClient.Socket;
    // Current session id.
    sessionID: string;
    // Form response type.
    formType: ResponseFormType;
};

/**
 * Component displaying a list of file responses. 
 */
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

    if (!requestIsLoaded(userAnswered) && !requestIsLoaded(form)) {
        return <Loader className="pt-4 pb-4" />;
    }

    return (
        <div>
            <h4>{props.question}</h4>
            {form.data?.description !== "" ? (
                <h1>Description: {form.data?.description}</h1>
            ) : (
                <h1>No description was provided</h1>
            )}
            <hr></hr>

            {userAnswered.data?.found ? (
                <div style={{ color: "red" }}>You have already answered.</div>
            ) : (
                <UploadContainer
                    {...props}
                    roomType={RoomType.CLASS}
                    uploadType={FileUploadType.RESPONSE}
                    formID={props.formID}
                    back={props.back}
                ></UploadContainer>
            )}
            <Button
                onClick={() => {
                    props.back();
                }}
                size="sm"
                className="mt-4"
            >
                Back
            </Button>
        </div>
    );
};
