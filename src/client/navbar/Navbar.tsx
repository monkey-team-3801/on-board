import React from "react";
import { Link } from "react-router-dom";
import { NavbarData } from "./NavbarData";
import "./Navbar.less";
function Navbar() {
    return (
        <div className="my-nav">
            <div className="navbar responsive">
                <nav className="navbar active nav-menu responsive">
                    <div className="navbar-logo">Logo</div>
                    <ul className="nav-menu">
                        {NavbarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;
