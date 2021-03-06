import format from "date-fns/format";
import {
    MDBBtn,
    MDBCardBody,
    MDBCardTitle,
    MDBCol,
    MDBJumbotron,
} from "mdbreact";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { AiOutlineMessage } from "react-icons/ai";
import { BiCalendarEvent, BiRightArrow } from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";
import "./Homepage.less";
import { RouteComponentProps } from "react-router-dom";
import FadeIn from "react-fade-in";

type Props = RouteComponentProps & {
    // Current username
    username: string;
    // Amount of unread messages.
    newMessagesAmount: number;
    // Amount of upcoming classes.
    upcomingClassesAmount: number;
    // Amount of events on the current day.
    eventsAmount: number;
};

export const UserHeaderJumbotron: React.FunctionComponent<Props> = (
    props: Props
) => {
    const {
        username,
        newMessagesAmount,
        upcomingClassesAmount,
        eventsAmount,
    } = props;

    const [currentTime, setCurrentTime] = React.useState<number>(
        new Date().getTime()
    );

    React.useEffect(() => {
        const intervalRef = setInterval(() => {
            setCurrentTime((time) => {
                return time + 1000;
            });
        }, 1000);
        return () => {
            clearInterval(intervalRef);
        };
    }, []);

    const hasNoNotifications = React.useMemo(() => {
        return (
            newMessagesAmount === 0 &&
            upcomingClassesAmount === 0 &&
            eventsAmount === 0
        );
    }, [newMessagesAmount, upcomingClassesAmount, eventsAmount]);

    const dateObject = React.useMemo(() => {
        return new Date(currentTime);
    }, [currentTime]);

    return (
        <MDBJumbotron className="home-jumbotron mt-3 mb-2 p-0">
            <MDBCol className="text-white py-5 px-5 peach-gradient">
                <Container fluid style={{ minHeight: "160px" }}>
                    <Row>
                        <Col lg="4">
                            <MDBCardTitle>
                                <FadeIn>
                                    <h1>{`Welcome ${username}`}</h1>
                                </FadeIn>
                            </MDBCardTitle>
                            <MDBCardBody>
                                {hasNoNotifications ? (
                                    <Row>All caught up!</Row>
                                ) : (
                                    <FadeIn delay={100}>
                                        <Row className="d-flex align-items-center">
                                            <AiOutlineMessage className="mr-2" />
                                            <p>{`${
                                                newMessagesAmount || "No"
                                            } Unread Message`}</p>
                                        </Row>
                                        <Row className="d-flex align-items-center">
                                            <FaChalkboardTeacher className="mr-2" />
                                            <p>{`${
                                                upcomingClassesAmount || "No"
                                            } Upcoming Classes`}</p>
                                        </Row>
                                        <Row className="d-flex align-items-center">
                                            <BiCalendarEvent className="mr-2" />{" "}
                                            <p>{`${
                                                eventsAmount || "No"
                                            } Events`}</p>
                                        </Row>
                                    </FadeIn>
                                )}
                            </MDBCardBody>
                        </Col>
                        <Col lg="4" className="d-flex align-items-center">
                            <MDBCardBody className="text-center time">
                                <FadeIn delay={100}>
                                    <h1>{format(dateObject, "hh:mm:ss")}</h1>
                                    <p>
                                        {format(
                                            dateObject,
                                            "EEEE, dd MMMM yyyy"
                                        )}
                                    </p>
                                </FadeIn>
                            </MDBCardBody>
                        </Col>
                        <Col
                            lg="4"
                            className="d-flex align-items-center flex-row-reverse"
                        >
                            <FadeIn>
                                <MDBBtn
                                    outline
                                    gradient="peach"
                                    color="yellow"
                                    className="d-flex align-items-center light-outline"
                                    onClick={() => {
                                        props.history.push("/classes");
                                    }}
                                >
                                    Today's Classes{" "}
                                    <BiRightArrow className="ml-2" />
                                </MDBBtn>
                            </FadeIn>
                        </Col>
                    </Row>
                </Container>
            </MDBCol>
        </MDBJumbotron>
    );
};
