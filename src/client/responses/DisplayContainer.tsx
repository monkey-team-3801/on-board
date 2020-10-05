import React from "react";
import { Container, Row } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType, UserType } from "../../types";
import { Loader } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { DisplayResultsContainer } from "./DisplayResultsContainer";
import { FileDisplay } from "./FileDisplay";
import { FormListContainer } from "./FormListContainer";
import { MultipleChoiceDisplay } from "./MultipleChoiceDisplay";

type Props = {
    sessionID: string;
    uid: string;
    userType: UserType;
    sock: SocketIOClient.Socket;
};

export const DisplayContainer = (props: Props) => {
    const [forms, getForms] = useDynamicFetch<
        {
            MC: Array<[string, string]>;
            SA: Array<[string, string]>;
            FF: Array<[string, string]>;
        },
        { sid: string }
    >("/response-handler/getFormsBySession", { sid: props.sessionID }, true);

    const [formData, setFormData] = React.useState<
        | {
              formID: string;
              question: string;
              formType: ResponseFormType;
          }
        | undefined
    >();

    const [data, setData] = React.useState<{
        MC: Array<[string, string]>;
        SA: Array<[string, string]>;
        FF: Array<[string, string]>;
    }>({ MC: [], SA: [], FF: [] });

    const updateForms = React.useCallback(() => {
        getForms({ sid: props.sessionID });
    }, [getForms, props.sessionID]);

    React.useEffect(() => {
        props.sock.on(ResponseFormEvent.NEW_FORM, updateForms);
        return () => {
            props.sock.off(ResponseFormEvent.NEW_FORM, updateForms);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (requestIsLoaded(forms)) {
            setData(forms.data);
        }
    }, [forms]);

    if (!requestIsLoaded(forms)) {
        return <Loader className="pt-4 pb-4" />;
    }

    if (data.MC.length === 0 && data.SA.length === 0) {
        return <p>There are no questions</p>;
    }

    return (
        <Container className="pl-4 pr-4">
            {!formData ? (
                <>
                    {data.MC.length > 0 && (
                        <>
                            <Row>
                                <h4>Multiple Choice</h4>
                            </Row>
                            <Row>
                                <Container>
                                    <FormListContainer
                                        data={data.MC}
                                        userType={props.userType}
                                        setFormDisplay={(formID, question) => {
                                            setFormData({
                                                formID,
                                                question,
                                                formType:
                                                    ResponseFormType.MULTIPLE_CHOICE,
                                            });
                                        }}
                                    />
                                </Container>
                            </Row>
                        </>
                    )}

                    <hr />
                    {data.SA.length > 0 && (
                        <>
                            <Row>
                                <h4>Short Answer</h4>
                            </Row>
                            <Row>
                                <Container>
                                    <FormListContainer
                                        data={data.SA}
                                        userType={props.userType}
                                        setFormDisplay={(formID, question) => {
                                            setFormData({
                                                formID,
                                                question,
                                                formType:
                                                    ResponseFormType.SHORT_ANSWER,
                                            });
                                        }}
                                    />
                                </Container>
                            </Row>
                        </>
                    )}

                    <hr />
                    {data.FF.length > 0 && (
                        <>
                            <Row>
                                <h4>File Collection</h4>
                            </Row>
                            <Row>
                                <Container>
                                    <FormListContainer
                                        data={data.FF}
                                        userType={props.userType}
                                        setFormDisplay={(formID, question) => {
                                            setFormData({
                                                formID,
                                                question,
                                                formType: ResponseFormType.FILE,
                                            });
                                        }}
                                    />
                                </Container>
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <>
                    {props.userType === UserType.STUDENT ? (
                        <>
                            <MultipleChoiceDisplay
                                formID={formData.formID}
                                question={formData.question}
                                back={() => {
                                    setFormData(undefined);
                                }}
                                uid={props.uid}
                                sock={props.sock}
                                sid={props.sessionID}
                                formType={ResponseFormType.MULTIPLE_CHOICE}
                            />
                            {/* <FileDisplay
                                formID={formData.formID}
                                question={formData.question}
                                back={() => {
                                    setFormData(undefined);
                                }}
                                userID={props.uid}
                                socket={props.sock}
                                sessionID={props.sessionID}
                                formType={ResponseFormType.FILE}
                            /> */}
                        </>
                    ) : (
                        <>
                            <DisplayResultsContainer
                                formData={formData}
                                back={() => {
                                    setFormData(undefined);
                                }}
                                sock={props.sock}
                            />
                        </>
                    )}
                </>
            )}
        </Container>
    );
};
