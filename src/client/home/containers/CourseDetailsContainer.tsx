import React from "react";
import { Container, Row } from "react-bootstrap";
import { UserDataResponseType, UserType } from "../../../types";
import { CourseStaffList } from "./CourseStaffList";

type Props = {
    // Course code of this container.
    courseCode: string;
    // Current user data.
    userData: Array<Omit<UserDataResponseType, "courses">>;
    // List of online users.
    onlineUsers: Array<string>;
    // Show a horizontal line below this container?
    showHr?: boolean;
};

/**
 *
 * @param props
 */
export const CourseDetailsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData } = props;

    const coordinators = React.useMemo(() => {
        return userData.filter((user) => {
            return user.userType === UserType.COORDINATOR;
        });
    }, [userData]);

    const tutors = React.useMemo(() => {
        return userData.filter((user) => {
            return user.userType === UserType.TUTOR;
        });
    }, [userData]);

    return (
        <Container className="mt-2">
            <Row>
                <h2 className="m-0">{props.courseCode}</h2>
            </Row>
            <CourseStaffList
                header="Coordinators"
                users={coordinators}
                onlineUsers={props.onlineUsers}
            />
            <CourseStaffList
                header="Tutors"
                users={tutors}
                onlineUsers={props.onlineUsers}
            />
            {props.showHr && <hr />}
        </Container>
    );
};
