import React from "react";
import { TimetableSession } from "../../types";
import "./CalendarDay.less";

interface Props {
    sessionsInDay: Array<TimetableSession>;
    date: Date;
    chosenMonth: number;
    chosenYear: number;
}

export const CalendarDay: React.FunctionComponent<Props> = (props: Props) => {
    const { sessionsInDay, date, chosenMonth, chosenYear } = props;
    const dateInChosenRange: boolean =
        date.getMonth() === chosenMonth && date.getFullYear() === chosenYear;
    return (
        <div
            className={`calendar-date ${
                !dateInChosenRange ? "outside-range" : ""
            }`}
        >
            {date.getDate()}
        </div>
    );
};
