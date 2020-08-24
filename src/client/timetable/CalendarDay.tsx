import React from "react";
import { CourseActivityResponseType } from "../../types";
import "./CalendarDay.less";
import { startOfDay } from "date-fns";

interface Props {
    sessionsInDay: Array<CourseActivityResponseType>;
    date: Date;
    chosenMonth: number;
    chosenYear: number;
}

export const CalendarDay: React.FunctionComponent<Props> = (props: Props) => {
    const { date, chosenMonth, chosenYear } = props;
    const dateInChosenRange: boolean =
        date.getMonth() === chosenMonth && date.getFullYear() === chosenYear;
    return (
        <div
            className={`calendar-date 
            ${!dateInChosenRange ? "outside-range" : ""}
            ${
                startOfDay(date).getTime() === startOfDay(new Date()).getTime()
                    ? "today"
                    : ""
            }`}
        >
            {date.getDate()}
        </div>
    );
};
