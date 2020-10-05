import React from "react";
import { Table } from "react-bootstrap";

type Props = {
    data: Array<[string, string]>;
};

export const ShortAnswerResultsTable: React.FunctionComponent<Props> = (
    props: Props
) => {
    return props.data.length === 0 ? (
        <p>No responses yet</p>
    ) : (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Response</th>
                </tr>
            </thead>
            <tbody>
                {props.data.map(([user, response], i) => (
                    <tr key={i}>
                        <td>{user}</td>
                        <td>{response}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};
