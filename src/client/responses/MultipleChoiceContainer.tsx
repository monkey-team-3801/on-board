import { Map } from "immutable";
import React from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";

type Props = {
    q: string;
};

export const MultipleChoiceContainer = (props: Props) => {
    const [answerAmount, setAnswerAmount] = React.useState<number>(2);

    return (
        <div>
            <h1>{props.q}</h1>
            <Form>
                <Form.Group>
                    Use the buttons below to add or remove fields<br></br>
                    <ButtonGroup>
                        <Button>+</Button>
                        <Button>-</Button>
                    </ButtonGroup>
                </Form.Group>
            </Form>
        </div>
    );
};
