import React from "react";
import { useFetch } from "../hooks";
import {
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { Row } from "react-bootstrap";

import "./Announcements.less";
import { AnnouncementEntry } from "./AnnouncementEntry";
type Props = {
    userId: string;
    refreshKey: number;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AnnouncementsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, refreshKey, setLoading } = props;

    const apiData = React.useMemo(() => {
        return {
            userId: userId,
        };
    }, [userId]);

    const [announcementsData, refresh] = useFetch<
        GetAnnouncementsResponseType,
        GetAnnouncementsRequestType
    >("/courses/announcements", apiData);

    React.useEffect(() => {
        refresh();
    }, [refreshKey, refresh]);

    React.useEffect(() => {
        if (requestIsLoaded(announcementsData)) {
            setLoading(false);
        }
    }, [announcementsData, setLoading]);

    return (
        <>
            <div className="announcement-list">
                {announcementsData.data &&
                    announcementsData.data.announcements.map(
                        (announcement, i) => {
                            return (
                                <Row className="announcement" key={i}>
                                    <AnnouncementEntry
                                        announcement={announcement}
                                    />
                                    <hr />
                                </Row>
                            );
                        }
                    )}
            </div>
        </>
    );
};
