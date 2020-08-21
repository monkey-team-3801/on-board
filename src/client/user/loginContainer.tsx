import React from "react";

export class loginContainer extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <h1>login test</h1>
                <form>
                    <input type="text" placeholder="username" />
                    <input type="text" placeholder="password" />
                    <button type="submit">login</button>
                </form>
            </div>
        );
    }
}
