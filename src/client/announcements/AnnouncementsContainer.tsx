import React from "react";
import { useFetch } from "../hooks";
import {
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { Row, Container, Col, Form } from "react-bootstrap";

import "./Announcements.less";
import { AnnouncementEntry } from "./AnnouncementEntry";
import Select from "react-select";
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

    const [roomFilterValue, setRoomFilterValue] = React.useState<string>("");
    const [roomActiveFilter, setRoomActiveFilter] = React.useState<string>("");

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
                {announcementsData.data &&
                    announcementsData.data.announcements.map(
                        (announcement, i) => {
                            return (
                                <>
                                    <Row className="announcement my-4" key={i}>
                                        <AnnouncementEntry
                                            announcement={announcement}
                                        />
                                    </Row>
                                    <hr />
                                </>
                            );
                        }
                    )}
            </Container>
        </>
    );
};
