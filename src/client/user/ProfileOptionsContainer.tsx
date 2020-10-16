import React from "react";
import { Button, Container, Form } from "react-bootstrap";

export const ProfileOptionsContainer: React.FunctionComponent = () => {
    return (
        <Container>
            <h2>General</h2>
            <h5>Change your personal details here.</h5>
            <hr></hr>
            <Form>
                <Form.Label>Change Your Password:</Form.Label>
                <Form.Control></Form.Control>
                <Button>Submit</Button>
            </Form>
        </Container>
    );
};
