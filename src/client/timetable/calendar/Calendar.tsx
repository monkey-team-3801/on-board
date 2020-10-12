import React, { useCallback } from "react";
import {
    startOfMonth,
    startOfISOWeek,
    endOfMonth,
    endOfISOWeek,
    eachDayOfInterval,
    startOfDay,
} from "date-fns";
import { CourseActivityResponseType } from "../../../types";
import { CalendarDay } from "./CalendarDay";
import "./Calendar.less";
import { CalendarHeading } from "./CalendarHeading";
import { Container, Row } from "react-bootstrap";
import { UpcomingEventsContainer } from "./UpcomingEventsContainer";

type Props = {
    sessions: Array<CourseActivityResponseType>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Calendar: React.FunctionComponent<Props> = ({
    sessions,
    setLoading,
}) => {
    const today = new Date();
    const [chosenMonth, setMonth] = React.useState<number>(today.getMonth());
    const [chosenYear, setYear] = React.useState<number>(today.getFullYear());
    const [chosenDate, setDate] = React.useState<Date>(today);
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

    const setMonthRange = useCallback((month: number, year: number) => {
        setMonth(month);
        setYear(year);
    }, []);

    const chooseDate = useCallback(
        (date: number, month: number, year: number) => {
            setDate(new Date(year, month, date));
            setMonthRange(month, year);
        },
        [setMonthRange]
    );

    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);
    return (
        <>
            <Row>
                <Container>
                    <CalendarHeading
                        month={chosenMonth}
                        year={chosenYear}
                        setMonthRange={setMonthRange}
                    />
                    <div className="calendar-today-button">
                        <small>
                            <a
                                href="#!"
                                onClick={(e) => {
                                    e.preventDefault();
                                    chooseDate(
                                        today.getDate(),
                                        today.getMonth(),
                                        today.getFullYear()
                                    );
                                }}
                            >
                                (go to today)
                            </a>
                        </small>
                    </div>
                    <div className="calendar-container">
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                            (dayName: string) => (
                                <div key={dayName} className="day-headings">
                                    {dayName}
                                </div>
                            )
                        )}
                        {/* TODO: fetch session data from server */}
                        {lastMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                sessionsInDay={[]}
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                key={index}
                            />
                        ))}
                        {chosenMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                sessionsInDay={[]}
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                key={index}
                            />
                        ))}
                        {nextMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                sessionsInDay={[]}
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                key={index}
                            />
                        ))}
                    </div>
                </Container>
            </Row>
            <Row>
                <Container>
                    <UpcomingEventsContainer
                        chosenMonth={chosenMonth}
                        chosenYear={chosenYear}
                    />
                </Container>
            </Row>
        </>
    );
};
