import React from "react";
import { Button, Row } from "react-bootstrap";
import { UserType } from "../../types";

type Props = {
    data: Array<[string, string]>;
    userType: UserType;
    setFormDisplay: (key: string, value: string) => void;
};

export const FormListContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            {props.data.map(([key, value], index) => (
                <Row
                    key={index}
                    className="d-flex justify-content-between pt-1 pd-1"
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
