import React, { Component } from 'react'

class Userboard extends Component {
    constructor() {
        super({});

        this.state = {
            users: []
        };

        fetch('/users')
            .then(response => response.json())
            .then(x => this.setState({
                users: x
            }));
    }

    render() {
        const users = this.state.users;

        return (
            <div>
                <h2>
                    Select a user to begin
                </h2>

                { Userboard.renderUserList(users) }
            </div>
        )
    }

    static renderUserList(users) {
        return users.map((user) => <div key={user}>
           <a href={`/user/${user}`}>{user}</a>
        </div>)
    }
}

export default Userboard;
