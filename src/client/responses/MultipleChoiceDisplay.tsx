import React from "react";
import { Form } from "react-bootstrap";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
};

export const MultipleChoiceDisplay = (props: Props) => {
    const [form, getFormData] = useDynamicFetch<any, any>(
        "/response-handler/getMCFormByID",
        { formID: props.formID },
        true
    );

    if (!requestIsLoaded(form)) {
        return <div>loading...</div>;
    }

    console.log(form);

    return (
        <div>
            <Form></Form>
        </div>
    );
};
