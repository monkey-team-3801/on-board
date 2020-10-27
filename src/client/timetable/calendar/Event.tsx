import { format } from "date-fns";
import React from "react";
import { Card } from "react-bootstrap";
import { CourseActivity } from "../../../types";

type Props = {
    courseCode: string;
    activity: CourseActivity;
};

/**
 * Event component displaying the details of a single event.
 */
export const Event: React.FunctionComponent<Props> = (props: Props) => {
    const { activity, courseCode } = props;
    const startTime = React.useMemo(() => {
        return new Date(activity.startDate);
    }, [activity.startDate]);

    const endTime = React.useMemo(() => {
        return new Date(startTime.getTime() + activity.duration * 60 * 1000);
    }, [startTime, activity.duration]);

    const durationString = React.useMemo(() => {
        return `${format(startTime, "EEEE, dd MMMM yyyy hh:mm")} - ${format(
            endTime,
            "hh:mm"
        )}`;
    }, [startTime, endTime]);

    return (
        <Card className="event my-2">
            <Card.Header className="peach-gradient">{`${courseCode}`}</Card.Header>
            <Card.Body>
                <Card.Title>{`${activity.type} ${activity.code}`}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {durationString}
                </Card.Subtitle>
                <Card.Text>No description</Card.Text>
            </Card.Body>
        </Card>
    );
};
