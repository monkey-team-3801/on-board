import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    startOfMonth,
    startOfISOWeek,
    endOfMonth,
    endOfISOWeek,
    eachDayOfInterval,
    startOfDay,
    getISODay,
    differenceInCalendarISOWeeks,
} from "date-fns";
import {
    CourseActivity,
    CourseActivityResponseType,
    UserEnrolledCoursesResponseType,
} from "../../../types";
import { CalendarDay } from "./CalendarDay";
import "./Calendar.less";
import { CalendarHeading } from "./CalendarHeading";
import { Container, Row } from "react-bootstrap";
import { UpcomingEventsContainer } from "./UpcomingEventsContainer";
import { useCachedFetch } from "../../hooks/useCachedFetch";
import { requestIsLoaded } from "../../utils";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Calendar: React.FunctionComponent<Props> = ({ setLoading }) => {
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

    // TODO: For now don't need to send filter.
    const [activityResponse, refetch] = useCachedFetch<
        CourseActivityResponseType
    >("get", "/courses/enrolled-activities");
    console.log(activityResponse.data);
    useEffect(() => {
        setLoading(false);
    }, [setLoading]);
    const getRelevantActivities = useCallback<
        (chosenDate: Date) => CourseActivityResponseType
    >(
        (chosenDate) => {
            if (!requestIsLoaded(activityResponse)) {
                return {};
            }
            return Object.entries(activityResponse.data).reduce(
                (
                    courseActivitiesSoFar: CourseActivityResponseType,
                    [courseCode, activities]
                ) => {
                    return {
                        ...courseActivitiesSoFar,
                        [courseCode]: activities.filter((activity) => {
                            const day = getISODay(chosenDate);
                            const startDate = new Date(activity.startDate);
                            const numWeeksFromStartDate = differenceInCalendarISOWeeks(
                                chosenDate,
                                startDate
                            );
                            return (
                                day === activity.dayOfWeek &&
                                activity.weeks[numWeeksFromStartDate]
                            );
                        }),
                    };
                },
                {}
            );
        },
        [activityResponse]
    );
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
                        {lastMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                getRelevantActivities={getRelevantActivities}
                                key={index}
                            />
                        ))}
                        {chosenMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                getRelevantActivities={getRelevantActivities}
                                key={index}
                            />
                        ))}
                        {nextMonthRange.map((date: Date, index: number) => (
                            <CalendarDay
                                date={date}
                                chosenDate={chosenDate}
                                chosenMonth={chosenMonth}
                                chosenYear={chosenYear}
                                chooseDate={chooseDate}
                                getRelevantActivities={getRelevantActivities}
                                key={index}
                            />
                        ))}
                    </div>
                </Container>
            </Row>
            <Row>
                <Container>
                    <UpcomingEventsContainer
                        getRelevantActivities={getRelevantActivities}
                        chosenDate={chosenDate}
                    />
                </Container>
            </Row>
        </>
    );
};
