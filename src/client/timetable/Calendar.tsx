import React from "react";
import {
    startOfMonth,
    startOfISOWeek,
    endOfMonth,
    endOfISOWeek,
    eachDayOfInterval,
    startOfDay,
} from "date-fns";
import { CourseActivityResponseType } from "../../types";
import { CalendarDay } from "./CalendarDay";
import "./Calendar.less";
import { CalendarHeading } from "./CalendarHeading";

interface Props {
    sessions: Array<CourseActivityResponseType>;
}

export interface State {
    chosenMonth: number;
    chosenYear: number;
}

export const Calendar: React.FunctionComponent<Props> = ({ sessions }) => {
    const [{ chosenMonth, chosenYear }, setTimeFrame] = React.useState<State>({
        chosenMonth: new Date().getMonth(),
        chosenYear: new Date().getFullYear(),
    });
    const firstDayOfMonth: Date = startOfMonth(
        new Date(chosenYear, chosenMonth)
    );
    const firstDayShown: Date = startOfISOWeek(firstDayOfMonth);
    const lastDayOfMonth: Date = startOfDay(endOfMonth(firstDayOfMonth));
    const lastDayShown: Date = startOfDay(endOfISOWeek(lastDayOfMonth));
    const lastMonthRange: Array<Date> = eachDayOfInterval({
        start: firstDayShown,
        end: firstDayOfMonth,
    }).filter((date) => date.getTime() !== firstDayOfMonth.getTime());
    const chosenMonthRange: Array<Date> = eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
    });
    const nextMonthRange: Array<Date> = eachDayOfInterval({
        start: lastDayOfMonth,
        end: lastDayShown,
    }).filter((date) => date.getTime() !== lastDayOfMonth.getTime());
    return (
        <>
            <CalendarHeading month={chosenMonth} year={chosenYear} setTimeFrame={setTimeFrame}/>
            <div className="calendar-container">
                {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ].map((dayName: string) => (
                    <div key={dayName} className="day-headings">
                        {dayName}
                    </div>
                ))}
                {/* TODO: fetch session data from server */}
                {lastMonthRange.map((date: Date, index: number) => (
                    <CalendarDay
                        sessionsInDay={[]}
                        date={date}
                        chosenMonth={chosenMonth}
                        chosenYear={chosenYear}
                        key={index}
                    />
                ))}
                {chosenMonthRange.map((date: Date, index: number) => (
                    <CalendarDay
                        sessionsInDay={[]}
                        date={date}
                        chosenMonth={chosenMonth}
                        chosenYear={chosenYear}
                        key={index}
                    />
                ))}
                {nextMonthRange.map((date: Date, index: number) => (
                    <CalendarDay
                        sessionsInDay={[]}
                        date={date}
                        chosenMonth={chosenMonth}
                        chosenYear={chosenYear}
                        key={index}
                    />
                ))}
            </div>
        </>
    );
};
