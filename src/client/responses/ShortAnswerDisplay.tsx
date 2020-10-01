import React from "react";
import { Button, Form } from "react-bootstrap";

type Props = {
    formID: string;
    q: string;
    uid: string;
};

export const ShortAnswerDisplay = (props: Props) => {
    const [userResponse, setUserResponse] = React.useState<string>("");

    const submit = (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        console.log(userResponse);
    };

    return (
        <div>
            <h1>{props.q}</h1>
            <Form
                onSubmit={(e) => {
                    submit(e);
                }}
            >
                <Form.Label>Enter your response here:</Form.Label>
                <Form.Control
                    as="textarea"
                    onChange={(e) => {
                        setUserResponse(e.target.value);
                    }}
                />
                <br></br>
                <Button type="submit">Submit</Button>
            </Form>
        </div>
    );
};
