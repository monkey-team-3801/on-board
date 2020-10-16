import React from "react";
import { Button, Form } from "react-bootstrap";

export const GeneralOptionsContainer: React.FunctionComponent = () => {
    return (
        <div>
            <h2>General</h2>
            <h5>Change your personal details here.</h5>
            <hr></hr>
            <Form>
                <Form.Group>
                    <Form.Label>
                        <h6>Username</h6>
                    </Form.Label>
                    <Form.Control></Form.Control>
                    <Button size="sm">Change</Button>
                    <br></br>
                    <Form.Label>
                        <h6>Change Your Password</h6>
                    </Form.Label>
                    <Form.Control></Form.Control>
                    <Button size="sm">Change</Button>
                </Form.Group>
                <hr></hr>
                <Form.Group>
                    <Form.Label>
                        <h6>Location</h6>
                    </Form.Label>
                    <Form.Control></Form.Control>
                    <Form.Label>
                        <h6>Real Name</h6>
                    </Form.Label>
                    <Form.Control></Form.Control>
                    <Button size="sm">Save</Button>
                </Form.Group>
            </Form>
        </div>
    );
};
