import React from "react";

export class loginContainer extends React.Component<{}, {}> {
    constructor(props: {}) {
        super(props);

        this.state = {
            username: "",
            password: "",
        };
    }

    handleSubmit(event: any) {
        event.preventDefault();
        console.log(this.state);
    }

    render() {
        return (
            <div>
                <h1>login test</h1>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <label htmlFor="username">Enter Username</label>
                    <br></br>

                    <input
                        name="username"
                        type="text"
                        placeholder="username"
                        onChange={(e) =>
                            this.setState({ username: e.target.value })
                        }
                        required
                    />
                    <br></br>

                    <label htmlFor="password">Enter Password</label>
                    <br></br>

                    <input
                        name="password"
                        type="password"
                        placeholder="password"
                        onChange={(e) =>
                            this.setState({ password: e.target.value })
                        }
                        required
                    />
                    <br></br>

                    <button type="submit">login</button>
                </form>
            </div>
        );
    }
}
