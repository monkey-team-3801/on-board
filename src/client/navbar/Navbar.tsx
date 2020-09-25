import React from "react";
import { Dropdown } from "react-bootstrap";
import { Link, RouteComponentProps } from "react-router-dom";

import * as AiIcons from "react-icons/ai";
import "./Navbar.less";
import { LocalStorageKey } from "../types";

type Props = RouteComponentProps & {
    username?: string;
};

export const Navbar: React.FunctionComponent<Props> = (props: Props) => {
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
            <div className="nav-control right">
                <div className="welcome">
                    <p>Welcome {props.username}</p>
                </div>
                <Dropdown className="dropdown-override">
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