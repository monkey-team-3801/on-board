import React from "react";

type Props = {
    user: string;
    text: string;
};

export const ShortAnswerDisplayContainer = (props: Props) => {
    return (
        <div>
            <h2>{props.user}'s response:</h2>
            <p className="text-break">{props.text}</p>
            <hr></hr>
        </div>
    );
};
