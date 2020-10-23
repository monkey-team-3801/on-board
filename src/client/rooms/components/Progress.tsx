import React from "react";
import { Container } from "react-bootstrap";
import format from "date-fns/format";

type Props = {
    startTime: Date;
    endTime: Date;
};

export const Progress: React.FunctionComponent<Props> = (props: Props) => {
    const { startTime, endTime } = props;


    return (
        <Container className="d-flex align-items-center">
            <span className="start-time mr-2">{format(startTime, "hh:mm")}</span>
            <div className="progress-bar">
                <div
                    className="progress-inner"
                    style={{
                        width: "70%",
                    }}
                ></div>
            </div>
            <span className="end-time ml-2">format(endTime, "hh:mm")</span>
        </Container>
    );
};
