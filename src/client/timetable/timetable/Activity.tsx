import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { sessionStyleFromProps } from "./util";
import { CourseActivity } from "../../../types";

type Props = {
    details: CourseActivity;
    dayStartTime: number;
    dayEndTime: number;
    stacked: number;
    stackIndex: number;
};

/**
 * Component representing a single activity.
 */
export const Activity: React.FunctionComponent<Props> = ({
    details,
    dayStartTime,
    dayEndTime,
    stacked,
    stackIndex,
}) => {
    const popover = <Popover id={`${details.type}${details.code}-popover`} />;
    const startTime = details.time;
    const endTime = details.time + details.duration;
    return (
        <OverlayTrigger
            trigger={["focus", "hover"]}
            placement="auto"
            overlay={popover}
        >
            <div
                className="activity"
                style={sessionStyleFromProps(
                    startTime,
                    endTime,
                    dayStartTime,
                    dayEndTime,
                    stacked,
                    stackIndex
                )}
            >
                {details.type} {details.code}
            </div>
        </OverlayTrigger>
    );
};
