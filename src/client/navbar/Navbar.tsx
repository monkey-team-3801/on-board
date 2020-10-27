import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import { Link, RouteComponentProps } from "react-router-dom";
import { RoomEvent } from "../../events";
import { ChatModalStatusContext } from "../context";
import { socket } from "../io";
import { LocalStorageKey } from "../types";
import "./Navbar.less";

type Props = RouteComponentProps & {
    // Current username.
    username?: string;
    // Current user id.
    userid?: string;
    // Amount of new messages.
    newMessages?: number;
};

/**
 * Global navigation component.
 */
export const Navbar: React.FunctionComponent<Props> = (props: Props) => {
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
                </div>
            </div>
            <div className="nav-control right d-flex align-items-center">
                <Button
                    className="message-modal-button position-relative d-flex"
                    onClick={() => {
                        modalContext.onOpen?.();
                    }}
                >
                    <p>Chat</p>
                    {props.newMessages ? (
                        <div className="messages-count-orb">
                            {props.newMessages}
                        </div>
                    ) : (
                        <></>
                    )}
                </Button>
                <Dropdown
                    id="nav-profile-dropdown"
                    className="dropdown-override"
                >
                    <Dropdown.Toggle>
                        <AiIcons.AiOutlineMenu className="icon" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Header>Settings</Dropdown.Header>
                        <Dropdown.Item
                            onClick={() => {
                                props.history.push("/profile");
                            }}
                        >
                            Profile
                        </Dropdown.Item>
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
