import React from "react";
import { Button, Form } from "react-bootstrap";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
    q: string;
    back: Function;
};

export const MultipleChoiceDisplay = (props: Props) => {
    const [form] = useDynamicFetch<
        { [optionID: string]: string },
        { formID: string }
    >("/response-handler/getMCFormByID", { formID: props.formID }, true);

    const [checked, setChecked] = React.useState<number>(-1);
    const [option, setOption] = React.useState<string>("");

    if (!requestIsLoaded(form)) {
        return <div>loading...</div>;
    }

    const data = form.data;

    const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        console.log(option);
        props.back(0);
    };

    const handleCheck = (hash: string, index: number) => {
        setOption(hash.toString());
        setChecked(index);
    };

    return (
        <div>
            <Form
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <h1>{props.q}</h1>
                <Form.Group>
                    {Object.keys(data).map((x, i) => (
                        <Form.Check
                            key={i}
                            type={"radio"}
                            label={data[x]}
                            checked={checked === i}
                            onChange={() => {
                                handleCheck(x, i);
                            }}
                        ></Form.Check>
                    ))}
                </Form.Group>
                <Button type="submit" disabled={checked < 0}>
                    submit
                </Button>
            </Form>
        </div>
    );
};
