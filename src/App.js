import { isNewMessagePayload, isParticipantChangedEventPayload } from '@mitter-io/core'
import React, { Component } from 'react'
import ChannelComponent from './ChannelComponent'
import './App.css'

const CachedCredentialKey = "mitterCachedCredentials";

class App extends Component {
    constructor() {
        super();

        this.state = {
            channelMessages: {}
        }

        this.setChannels = this.setChannels.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.newChannel = this.newChannel.bind(this);
    }

    setChannels(participatedChannels) {
        const channelMessages = {}

        participatedChannels.forEach((participatedChannel) => {
            channelMessages[participatedChannel.channel.identifier] = []
        });

        this.setState((prevState) => {
            return Object.assign({}, prevState, {
                channelMessages
            })
        });
    }

    newChannel(channelId) {
        this.setState((prevState) => {
            if (channelId in this.state.channelMessages) {
                return prevState;
            } else {
                const newState = Object.assign({}, prevState, {
                    channelMessages: Object.assign({}, prevState.channelMessages, {
                        [channelId]: []
                    })
                });

                return newState;
            }
        });
    }

    newMessage(messagePayload) {
        this.setState((prevState) => {
            const channelId = messagePayload.channelId.identifier

            if (
                prevState.channelMessages[channelId]
                    .find(x => x.messageId === messagePayload.message.messageId) !== undefined
            ) {
                return prevState;
            }

            return Object.assign({}, prevState, {
                channelMessages: Object.assign({}, prevState.channelMessages, {
                    [messagePayload.channelId.identifier]:
                        prevState.channelMessages[messagePayload.channelId.identifier]
                                 .concat(messagePayload.message)
                })
            })
        })
    }

    componentDidMount() {
        const loggedUser = this.props.loggedUser;
        const cachedCredential = JSON.parse(localStorage.getItem(CachedCredentialKey));

        if (cachedCredential === null || cachedCredential['userId'] !== loggedUser) {
            localStorage.removeItem(CachedCredentialKey);

            fetch('/users/login', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: loggedUser
                })
            })
            .then(response => response.json())
            .then(loginResponse => this.initialize(loginResponse.mitterUserAuthorization))
        } else {
            this.initialize(cachedCredential.mitterUserAuthorization);
        }
    }

    initialize(mitterUserAuthorization) {
        const mitter = this.props.mitter;

        localStorage.setItem(CachedCredentialKey, JSON.stringify({
            userId: this.props.loggedUser,
            mitterUserAuthorization: mitterUserAuthorization
        }));

        mitter.setUserAuthorization(mitterUserAuthorization);

        mitter.clients().channels().participatedChannels()
              .then(channels => this.setChannels(channels));

        mitter.subscribeToPayload((payload) => {
            // Comment the next line if you do not wish to print out the payloads
            console.log('Received payload from mitter', payload);

            if (isNewMessagePayload(payload)) {
                this.newMessage(payload);
            } else if (isParticipantChangedEventPayload(payload)) {
                if (payload.oldStatus === undefined && payload.newStatus !== undefined && payload.newStatus !== null) {
                    this.newChannel(payload.channelId.identifier);
                }
            }
        })
    }

    render() {
        return (
            <div className='App'>
                <h2 className='application-title'>
                    <div class="title">
                        My Chat App
                    </div>

                  <div className='user-label'>
                      Welcome, <strong>{this.props.loggedUser}</strong>
                  </div>
              </h2>

              <ChannelComponent
                  mitter={this.props.mitter}
                  channelMessages={this.state.channelMessages}
                  selfUserId={this.props.loggedUser}
              />
          </div>
        );
    }
}

export default App;
