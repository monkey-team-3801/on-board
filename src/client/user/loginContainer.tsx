import React from "react";

export class loginContainer extends React.Component<{}, {}> {
    handleUsernameChange(event: any) {
        console.log("handle username change", event.target.value);
    }

    handlePasswordChange(event: any) {
        console.log("handle password change", event.target.value);
    }

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

                    <input
                        name="username"
                        type="text"
                        placeholder="username"
                        onChange={this.handleUsernameChange}
                        required
                    />
                    <br></br>

                    <label htmlFor="password">Enter Password</label>
                    <br></br>

                    <input
                        name="password"
                        type="password"
                        placeholder="password"
                        onChange={this.handlePasswordChange}
                        required
                    />
                    <br></br>

                    <button type="submit">login</button>
                </form>
            </div>
        );
    }
}
