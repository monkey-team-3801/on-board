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
    setShowLoader: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AnnouncementsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, refreshKey } = props;

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

    if (!requestIsLoaded(announcementsData)) {
        return <div>loading</div>;
    }

    return (
        <>
            <div className="announcement-list">
                {announcementsData.data.announcements.map((announcement, i) => {
                    return (
                        <Row className="announcement" key={i}>
                            <AnnouncementEntry announcement={announcement} />
                            <hr />
                        </Row>
                    );
                })}
            </div>
        </>
    );
};
