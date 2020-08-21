import React from "react";

export class loginContainer extends React.Component<{}, {}> {
    handleSubmit(event: any) {
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <h1>login test</h1>
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="username">Enter Username</label>
                    <br></br>

                    <input name="username" type="text" placeholder="username" />
                    <br></br>

                    <label htmlFor="password">Enter Password</label>
                    <br></br>

                    <input name="password" type="text" placeholder="password" />
                    <br></br>

                    <button type="submit">login</button>
                </form>
            </div>
        );
    }
}
