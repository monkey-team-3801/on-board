import React from "react";
import { Container, Form } from "react-bootstrap";
import { UserDataResponseType } from "../../../types";
import { Participants } from "../components";

type Props = {
    users: Array<Omit<UserDataResponseType, "courses">>;
    raisedHandUsers: Array<string>;
};

export const ParticipantsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { users } = props;

    const [filterValue, setFilterValue] = React.useState<string>("");

    const filteredUsers = React.useMemo(() => {
        return filterValue === ""
            ? users
            : users.filter((user) => {
                  return user.username.includes(filterValue);
              });
    }, [filterValue, users]);

    return (
        <Container>
            <Form.Control
                type="text"
                onChange={(e) => {
                    setFilterValue(e.target.value);
                }}
            />
            <Participants
                users={filteredUsers}
                raisedHandUsers={props.raisedHandUsers}
            />
        </Container>
    );
};