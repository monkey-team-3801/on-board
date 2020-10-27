import React from "react";
import { Container, Form } from "react-bootstrap";
import { UserDataResponseType } from "../../../types";
import { Participants } from "../components";
import * as AiIcons from "react-icons/ai";

type Props = {
    // List of users in the current session.
    users: Array<Omit<UserDataResponseType, "courses">>;
    // List of users which have their hande raised.
    raisedHandUsers: Array<string>;
    // Current user id.
    myUserId: string;
};

/**
 * Container for displaying the list of participants in a room/
 */
export const ParticipantsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { users, raisedHandUsers } = props;

    const [filterValue, setFilterValue] = React.useState<string>("");

    const filteredUsers = React.useMemo(() => {
        return filterValue === ""
            ? users
            : users.filter((user) => {
                  return user.username.includes(filterValue);
              });
    }, [filterValue, users]);

    const sortedUsers = React.useMemo(() => {
        return filteredUsers.sort((user) => {
            return raisedHandUsers.includes(user.id) ? -1 : 1;
        });
    }, [filteredUsers, raisedHandUsers]);

    return (
        <Container>
            <Container className="search-bar mt-2">
                <Form.Control
                    type="text"
                    className="mr-2"
                    placeholder="Find a person..."
                    onChange={(e) => {
                        setFilterValue(e.target.value);
                    }}
                />
                <AiIcons.AiOutlineSearch />
            </Container>
            <Participants
                users={sortedUsers}
                raisedHandUsers={raisedHandUsers}
                myUserId={props.myUserId}
            />
        </Container>
    );
};
