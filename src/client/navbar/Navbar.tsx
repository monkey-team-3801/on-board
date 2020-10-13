import React from "react";
import { Dropdown, Button } from "react-bootstrap";
import { Link, RouteComponentProps } from "react-router-dom";

import * as AiIcons from "react-icons/ai";
import "./Navbar.less";
import { LocalStorageKey } from "../types";
import { socket } from "../io";
import { RoomEvent } from "../../events";
import { userInfo } from "os";
import { ChatModalStatusContext } from "../context";
import { useFetch } from "../hooks";

type Props = RouteComponentProps & {
    username?: string;
    userid?: string;
};

export const Navbar: React.FunctionComponent<Props> = (props: Props) => {
    const [hasNewMessage, setHasNewMessage] = React.useState(false);

    const [x, y] = useFetch("/chat/hasNewMessage");

    React.useEffect(() => {}, []);

    const modalContext = React.useContext(ChatModalStatusContext);

    return (
        <nav className="on-board-nav">
            <div className="nav-control left">
                <div className="logo-container">
                    <div className="logo" />
                </div>
                <div className="control">
                    <Link
                        to="/home"
                        className={`link ${
                            props.location.pathname === "/home" ? "active" : ""
                        }`}
                    >
                        <AiIcons.AiOutlineHome className="icon" />
                        <p>Home</p>
                    </Link>
                    <Link
                        to="/classes"
                        className={`link ${
                            props.location.pathname === "/classes"
                                ? "active"
                                : ""
                        }`}
                    >
                        <AiIcons.AiOutlinePlayCircle className="icon" />
                        <p>Classes</p>
                    </Link>
                    <Button
                        onClick={() => {
                            modalContext.onOpen?.();
                        }}
                    >
                        <AiIcons.AiOutlinePlayCircle className="icon" />
                        <p>Messages</p>
                    </Button>
                </div>
            </div>
            <div className="nav-control right">
                <div className="welcome">
                    <p>
                        Welcome {props.username} ({props.userid})
                    </p>
                </div>
                <Dropdown
                    id="nav-profile-dropdown"
                    className="dropdown-override"
                >
                    <Dropdown.Toggle>
                        <AiIcons.AiOutlineMenu className="icon" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Header>Settings</Dropdown.Header>
                        <Dropdown.Item>Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() => {
                                localStorage.setItem(
                                    LocalStorageKey.JWT_TOKEN,
                                    ""
                                );
                                props.history.replace("/");
                                socket.emit(RoomEvent.SESSION_LEAVE, {
                                    sessionId: "global",
                                    userId: props.userid,
                                });
                            }}
                        >
                            Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </nav>
    );
};
