import React from "react";
import { Container } from "react-bootstrap";
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

    const [progress, setProgress] = React.useState<number>(
        props.startTime.getTime()
    );

    React.useEffect(() => {
        const timeoutRef = setTimeout(() => {
            setProgress((prev) => {
                return prev + 1;
            });
        }, 1000);
        return () => {
            clearTimeout(timeoutRef);
        };
    }, []);

    const progressPercent = React.useMemo(() => {
        return progress / endTime.getTime();
    }, [progress, endTime]);

    return (
        <Container className="d-flex align-items-center">
            <span className="start-time mr-2">
                {format(startTime, "hh:mm")}
            </span>
            <div className="progress-bar">
                <div
                    className="progress-inner"
                    style={{
                        width: `${progressPercent}%`,
                    }}
                ></div>
            </div>
            <span className="end-time ml-2">{format(endTime, "hh:mm")}</span>
        </Container>
    );
};
