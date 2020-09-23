import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./Classes.less";

type Props = {
    setShowLoader: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ClassesContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            <Row>
                <Container className="classes-list">
                    <Class />
                    <Class />
                    <Class />
                </Container>
            </Row>
        </>
    );
};

const Class = () => {
    return (
        <Container
            className="class-container"
            style={{
                backgroundColor: `#${Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .toString()}`,
            }}
        >
            <Row>
                <Col xl="6" lg="6" md="12">
                    <div className="content content-left">
                        <div className="course-code-container">
                            <h1>MATH3204</h1>
                        </div>
                        <div className="info-container">
                            <h2>Tutorial</h2>
                            <p>Today at 11AM</p>
                            <div className="download-container">
                                <Button variant="light" size="sm">
                                    Download Class Content
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xl="6" lg="6" md="12">
                    <div className="content content-right">
                        <div className="connect">
                            <Button variant="light">Connect</Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
