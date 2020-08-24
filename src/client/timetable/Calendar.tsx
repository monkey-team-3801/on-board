import React from "react";
import {
    startOfMonth,
    startOfISOWeek,
    endOfMonth,
    endOfISOWeek,
    eachDayOfInterval,
    format,
    startOfDay,
} from "date-fns";
import { CourseActivityResponseType } from "../../types";
import { CalendarDay } from "./CalendarDay";
import "./Calendar.less";

interface Props {
    sessions: Array<CourseActivityResponseType>;
}

interface State {
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
    const monthHeading: string = format(firstDayOfMonth, "MMMM, yyyy");
    return (
        <>
            <div className="month-heading">
                <div
                    className="left-chevron"
                    onClick={() =>
                        setTimeFrame((prevState) => {
                            const newChosenMonth: number =
                                prevState.chosenMonth - 1;
                            const newChosenYear: number =
                                newChosenMonth === -1
                                    ? prevState.chosenYear - 1
                                    : prevState.chosenYear;
                            return {
                                chosenMonth:
                                    newChosenMonth === -1 ? 11 : newChosenMonth,
                                chosenYear: newChosenYear,
                            };
                        })
                    }
                >
                    &lt;
                </div>
                <div>{monthHeading}</div>
                <div
                    className="right-chevron"
                    onClick={() =>
                        setTimeFrame((prevState) => {
                            const newChosenMonth =
                                (prevState.chosenMonth + 1) % 12;
                            const newChosenYear =
                                newChosenMonth === 0
                                    ? prevState.chosenYear + 1
                                    : prevState.chosenYear;
                            return {
                                chosenMonth: newChosenMonth,
                                chosenYear: newChosenYear,
                            };
                        })
                    }
                >
                    &gt;
                </div>
            </div>

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
