import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import * as AiIcons from "react-icons/ai";
import "./Navbar.less";
import { Dropdown } from "react-bootstrap";

type Props = RouteComponentProps;

export const Navbar: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <nav className="on-board-nav">
            <div className="nav-control left">
                <div className="logo-container">
                    <div className="logo" />
                </div>
                <div className="control">
                    <Link
                        to="home"
                        className={`link ${
                            props.location.pathname === "/home" ? "active" : ""
                        }`}
                    >
                        <AiIcons.AiOutlineHome className="icon" />
                        <p>Home</p>
                    </Link>
                    <Link
                        to="classes"
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
                <Dropdown className="dropdown-override">
                    <Dropdown.Toggle>
                        <AiIcons.AiOutlineMenu className="icon" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Header>Settings</Dropdown.Header>
                        <Dropdown.Item>Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                {/* <div>
                
                </div> */}
            </div>
        </nav>
    );

    // return (

    //     <div className="my-nav">
    //         <div className="navbar responsive">
    //             <nav className="navbar active nav-menu responsive">
    //                 <div className="navbar-logo">Logo</div>
    //                 <ul className="nav-menu">
    //                     {NavbarData.map((item, index) => {
    //                         return (
    //                             <li key={index} className={item.cName}>
    //                                 <Link to={item.path}>
    //                                     {item.icon}
    //                                     <span>{item.title}</span>
    //                                 </Link>
    //                             </li>
    //                         );
    //                     })}
    //                 </ul>
    //             </nav>
    //         </div>
    //     </div>
    // );
};
