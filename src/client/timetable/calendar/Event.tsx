import React from "react";
import { Card } from "react-bootstrap";
import { CourseActivity } from "../../../types";
import { format } from "date-fns";

type Props = {
    courseCode: string;
    activity: CourseActivity;
};

export const Event: React.FunctionComponent<Props> = (props: Props) => {
    const { activity, courseCode } = props;
    const startTime = new Date(activity.startDate);
    const endTime = new Date(startTime.getTime() + activity.duration * 60 * 1000);
    const durationString = `${format(startTime, "EEEE, dd MMMM yyyy hh:mm")} - ${format(endTime, "hh:mm")}`
    return (
        <Card className="event my-2">
            <Card.Header className="peach-gradient">{`${courseCode}`}</Card.Header>
            <Card.Body>
                <Card.Title>{`${activity.type} ${activity.code}`}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    { durationString }
                </Card.Subtitle>
                <Card.Text>
                    No description
                </Card.Text>
            </Card.Body>
        </Card>
    );
};
