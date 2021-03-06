import React, { useMemo } from "react";
import { CourseActivityResponseType } from "../../../types";
import "./CalendarDay.less";
import { startOfDay } from "date-fns";

interface Props {
    date: Date;
    chosenDate: Date;
    chosenMonth: number;
    chosenYear: number;
    chooseDate: (date: number, month: number, year: number) => void;
    getRelevantActivities: (chosenDate: Date) => CourseActivityResponseType;
}

/**
 * Component representing a single day in the calendar.
 */
export const CalendarDay: React.FunctionComponent<Props> = (props: Props) => {
    const {
        date,
        chosenMonth,
        chosenYear,
        chosenDate,
        chooseDate,
        getRelevantActivities,
    } = props;
    const dateInChosenRange: boolean =
        date.getMonth() === chosenMonth && date.getFullYear() === chosenYear;
    const relevantActivities = useMemo(() => getRelevantActivities(date), [
        getRelevantActivities,
        date,
    ]);

    const isBusy = React.useMemo(() => {
        return Object.values(relevantActivities).some(
            (arr) => arr.length !== 0
        );
    }, [relevantActivities]);

    return (
        <a
            href="#!"
            className={`calendar-date \
            ${!dateInChosenRange ? "outside-range" : ""} \
            ${
                startOfDay(date).getTime() === startOfDay(new Date()).getTime()
                    ? "today"
                    : ""
            } \
            ${
                date.getFullYear() === chosenDate.getFullYear() &&
                date.getMonth() === chosenDate.getMonth() &&
                date.getDate() === chosenDate.getDate()
                    ? "chosen-date"
                    : ""
            } \
            ${isBusy ? "busy" : ""}`}
            onClick={(e) => {
                e.preventDefault();
                chooseDate(date.getDate(), date.getMonth(), date.getFullYear());
            }}
        >
            {date.getDate()}
            {isBusy && <div className="orb" />}
        </a>
    );
};
