import { OrderedMap } from "immutable";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { ResponseFormEvent } from "../../events";
import { useDynamicFetch } from "../hooks";

type Props = {
    question: string;
    sessionID: string;
    closeModal: Function;
    uid: string;
    sock: SocketIOClient.Socket;
};

export const MultipleChoiceContainer = (props: Props) => {
    const initialValues: [string, string][] = [[uuidv4(), ""]];
    const initialMap = OrderedMap<string, string>(initialValues);
    const [options, setOptions] = React.useState<OrderedMap<string, string>>(
        initialMap
    );

    const [, uploadForm] = useDynamicFetch<
        undefined,
        {
            options: { [key: string]: string };
            question: string;
            sessionID: string;
            userID: string;
        }
    >("/response-handler/submitMcForm", undefined, false);

    const submitForm = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        const data = {
            options: options.toObject(),
            question: props.question,
            sessionID: props.sessionID,
            userID: props.uid,
        };
        await uploadForm(data);
        props.sock.emit(ResponseFormEvent.NEW_FORM, props.sessionID);
        props.closeModal();
    };

    return (
        <Form
            onSubmit={(e) => {
                submitForm(e);
            }}
        >
            <Form.Group>
                <Button
                    disabled={options.size > 5}
                    onClick={() => {
                        const key = uuidv4();
                        setOptions(options.set(key, ""));
                    }}
                >
                    Add Option
                </Button>
            </Form.Group>

            {Array.from(options.entries()).map(([key, value], i) => {
                return (
                    <Form.Group key={key}>
                        <Input
                            optionKey={key}
                            index={i}
                            value={value}
                            onChange={(key, value) => {
                                setOptions(options.set(key, value));
                            }}
                            onDelete={(key) => {
                                setOptions(options.delete(key));
                            }}
                        />
                    </Form.Group>
                );
            })}
            <Button type="submit" disabled={!props.question}>
                Submit
            </Button>
        </Form>
    );
};

const Input = ({
    optionKey,
    value,
    index,
    onDelete,
    onChange,
}: {
    optionKey: string;
    value: string;
    index: number;
    onDelete: (key: string) => void;
    onChange: (key: string, value: string) => void;
}) => {
    return (
        <div style={{ display: "block " }}>
            <p>Option {index + 1}</p>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(optionKey, e.target.value);
                }}
                required={true}
            />
            {index >= 1 && (
                <Button
                    onClick={() => {
                        onDelete(optionKey);
                    }}
                >
                    x
                </Button>
            )}
        </div>
    );
};