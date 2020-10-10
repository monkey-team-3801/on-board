import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.less";
import { AppRouter } from "./AppRouter";

export const App: React.FunctionComponent<{}> = () => {
    return <AppRouter></AppRouter>;
};
