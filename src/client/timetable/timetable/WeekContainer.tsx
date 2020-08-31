import React from "react";
import range from "lodash/range";

import "./WeekContainer.less";
import { WeekDay } from "./WeekDay";
import { CourseActivityResponseType } from "../../../types";
import { addWeeks, differenceInCalendarISOWeeks } from "date-fns";

type Props = {
    selectedYear: number;
    selectedWeek: number;
    dayStartTime: number;
    dayEndTime: number;
    activities: CourseActivityResponseType[];
};

export const WeekContainer: React.FunctionComponent<Props> = ({
    selectedYear,
    selectedWeek,
    dayStartTime,
    dayEndTime,
    activities,
}) => {
    const dayActivities: CourseActivityResponseType[] = activities.filter(
        (activity) => {
            const startOfChosenWeek = addWeeks(
                new Date(selectedYear),
                selectedWeek
            );
            const weekDifference = differenceInCalendarISOWeeks(
                startOfChosenWeek,
                activity.startDate
            );
            const endTime: number = activity.time + activity.duration;
            return (
                dayStartTime < endTime &&
                dayEndTime > activity.time &&
                activity.weeks[weekDifference]
            );
        }
    );
    return (
        <div className="timetable-week-container">
            {range(1, 8).map((isoDay) => (
                <WeekDay
                    dayStartTime={dayStartTime}
                    dayEndTime={dayEndTime}
                    activities={dayActivities}
                />
            ))}
        </div>
    );
};
