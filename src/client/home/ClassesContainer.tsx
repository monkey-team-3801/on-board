import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./Classes.less";

export const ClassesContainer = () => {
    return (
        <Container className="content-container" fluid>
            <Container className="content-internal classes-container" fluid>
                <Row>
                    <header>
                        <h1>Classes</h1>
                    </header>
                </Row>
                <Row>
                    <Container className="classes-list">
                        <Class />
                        <Class />
                        <Class />
                    </Container>
                </Row>
            </Container>
        </Container>
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
                            <h1>COURSE CODE</h1>
                        </div>
                        <div className="info-container">
                            <h2>Tutorial</h2>
                            <p>Today - 11AM</p>
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
                        <Button variant="light">Connect</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
