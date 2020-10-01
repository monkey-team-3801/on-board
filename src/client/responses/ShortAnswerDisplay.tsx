import React from "react";

type Props = {
    formID: string;
};

export const ShortAnswerDisplay = (props: Props) => {
    return <div>{props.formID}</div>;
};
