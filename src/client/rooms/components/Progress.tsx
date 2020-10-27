import React from "react";
import { Container, Row } from "react-bootstrap";
import format from "date-fns/format";

type Props = {
    // Start time of the session.
    startTime: Date;
    // End time of the session.
    endTime: Date;
};

/**
 * Component which ticks time remaining in a session.
 */
export const Progress: React.FunctionComponent<Props> = (props: Props) => {
    const { startTime, endTime } = props;
    const startTimeSeconds = startTime.getTime() / 1000;
    const endTimeSeconds = endTime.getTime() / 1000;
    const [progress, setProgress] = React.useState<number>(
        new Date().getTime() / 1000
    );

    React.useEffect(() => {
        console.log(startTimeSeconds);
    }, [startTimeSeconds]);

    React.useEffect(() => {
        const intervalRef = setInterval(() => {
            setProgress((prev) => {
                return prev + 1;
            });
        }, 1000);
        return () => {
            clearTimeout(intervalRef);
        };
    }, []);

    const progressPercent = React.useMemo(() => {
        return (
            100 -
            ((endTimeSeconds - progress) /
                (endTimeSeconds - startTimeSeconds)) *
                100
        );
    }, [progress, endTimeSeconds, startTimeSeconds]);

    const progressText = React.useMemo(() => {
        if (progressPercent < 0) {
            return "Class will start soon...";
        } else if (progressPercent > 0 && progressPercent < 100) {
            return "Class in progress...";
        } else {
            return "Class over...";
        }
    }, [progressPercent]);

    return (
        <Container>
            <Row className="d-flex align-items-center justify-content-center">
                <p className="text-muted">{progressText}</p>
            </Row>
            <Row className="d-flex align-items-center justify-content-center">
                <span className="start-time mr-2">
                    {format(startTime, "dd/mm hh:mm")}
                </span>
                <div className="progress-bar">
                    <div
                        className="progress-inner"
                        style={{
                            width: `${Math.max(
                                Math.min(progressPercent, 100),
                                0
                            )}%`,
                        }}
                    ></div>
                </div>
                <span className="end-time ml-2">
                    {format(endTime, "dd/mm hh:mm")}
                </span>
            </Row>
        </Container>
    );
};
