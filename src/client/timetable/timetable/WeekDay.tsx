import React from "react";
import range from "lodash/range";
import { TimeSlot } from "./TimeSlot";
import { CourseActivityResponseType } from "../../../types";
import { Activity } from "./Activity";

type Props = {
    dayStartTime: number;
    dayEndTime: number;
    activities: CourseActivityResponseType[];
};

export const WeekDay: React.FunctionComponent<Props> = ({
    dayStartTime,
    dayEndTime,
    activities,
}) => {
    // TODO: compute stacked and stack index
    return (
        <div className="week-day">
            {range(dayStartTime, dayEndTime).map((hour) => (
                <TimeSlot key={hour} />
            ))}
            {activities.map((activity) => (
                <Activity
                    details={activity}
                    dayStartTime={dayStartTime}
                    dayEndTime={dayEndTime}
                    stacked={0}
                    stackIndex={0}
                />
            ))}
        </div>
    );
};
