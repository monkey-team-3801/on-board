import React from "react";
import { Button, Row } from "react-bootstrap";
import { UserType } from "../../types";

type Props = {
    // Array of key value form pairs.
    data: Array<[string, string]>;
    // Current user type.
    userType: UserType;
    // Display the result of a specific form.
    setFormDisplay: (key: string, value: string) => void;
};

/**
 * Container rendering a list of forms created.
 */
export const FormListContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            {props.data.map(([key, value], index) => (
                <Row
                    key={index}
                    className="d-flex justify-content-between pt-1 pd-1 align-items-center"
                >
                    <p>{value}</p>
                    <Button
                        onClick={() => {
                            props.setFormDisplay(key, value);
                        }}
                        size="sm"
                    >
                        {props.userType === UserType.STUDENT
                            ? "Answer"
                            : "View Results"}
                    </Button>
                </Row>
            ))}
        </>
    );
};
