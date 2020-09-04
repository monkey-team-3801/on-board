import React from "react";
import { Link } from "react-router-dom";
import { NavbarData } from "./NavbarData";
import "./Navbar.less";
function Navbar() {
    return (
        <div className="my-nav">
            <div className="nav-container responsive">
                <nav className="nav-menu active nav-menu responsive">
                    <ul className="nav-menu-items">
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
