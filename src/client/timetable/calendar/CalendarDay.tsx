import React from "react";
import { CourseActivityResponseType } from "../../../types";
import "./CalendarDay.less";
import { startOfDay } from "date-fns";

interface Props {
    sessionsInDay: Array<CourseActivityResponseType>;
    date: Date;
    chosenDate: Date;
    chosenMonth: number;
    chosenYear: number;
    chooseDate: (date: number, month: number, year: number) => void;
}

export const CalendarDay: React.FunctionComponent<Props> = (props: Props) => {
    const { date, chosenMonth, chosenYear, chosenDate, chooseDate } = props;
    const dateInChosenRange: boolean =
        date.getMonth() === chosenMonth && date.getFullYear() === chosenYear;
    return (
        <a
            href="#!"
            className={`calendar-date
            ${!dateInChosenRange ? "outside-range" : ""}
            ${
                startOfDay(date).getTime() === startOfDay(new Date()).getTime()
                    ? "today"
                    : ""
            }
            ${
                date.getFullYear() === chosenDate.getFullYear() &&
                date.getMonth() === chosenDate.getMonth() &&
                date.getDate() === chosenDate.getDate()
                    ? "chosen-date"
                    : ""
            }`}
            onClick={(e) => {
                e.preventDefault();
                chooseDate(date.getDate(), date.getMonth(), date.getFullYear());
            }}
        >
            {date.getDate()}
        </a>
    );
};
