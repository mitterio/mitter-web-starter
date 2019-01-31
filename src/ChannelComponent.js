import React, { Component } from 'react'
import { createMessageViewProducer, MessageListManager } from '@mitter-io/react-scl'
import './Channel.css'

export default class ChannelComponent extends Component {
    constructor() {
        super();

        this.state = {
            activeChannel: null,
            typedMessage: ''
        }

        this.updateTypedMessage = this.updateTypedMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.keyPressHandler = this.keyPressHandler.bind(this);

        this.messageViewProducer = createMessageViewProducer(
            (message) => true,
            (message) => {
                const isSelfMessage = this.props.selfUserId === message.senderId.identifier

                return (
                <div className={ 'message' + (isSelfMessage ? ' self' : '')}>
                    <div className='message-block'> 
                        <span className='sender' ></span>

                        <div className='message-content'>
                            {message.textPayload}
                        </div>
                    </div>
                </div>
                )
            }
        )
    }

    componentDidUpdate() {
        if (Object.keys(this.props.channelMessages).length > 0) {
            if (this.state.activeChannel === null) {
                this.setActiveChannel(Object.keys(this.props.channelMessages)[0])()
            }
        }
    }

    renderChannelList() {
        return Object.keys(this.props.channelMessages).map(channelId => {
            const isChannelActive = this.state.activeChannel === channelId

            return (
                <div
                    key={channelId}
                    className={ 'channel-tile' + ((isChannelActive) ? ' active' : '') }
                    onClick={this.setActiveChannel(channelId)}
                >
                    { channelId }
                </div>
            )
        })
    }

    renderMessages() {
        if (this.state.activeChannel === null) {
            return <div></div>
        }

        const activeChannelMessages =
            this.props.channelMessages[this.state.activeChannel]

        return (
            <MessageListManager
                messages={activeChannelMessages}
                defaultView={this.messageViewProducer.produceView}
                producers={[this.messageViewProducer]}
                onEndCallback={() => { this.props.fetchPreviousPage(this.state.activeChannel) }}
            />
        )
    }

    sendMessage() {
        const mitter = this.props.mitter
        const messageToSend = this.state.typedMessage

        if (messageToSend.trim() === '') {
            return;
        }

        const privateMessagePattern = /^(@[a-zA-Z0-9]+)/
        const privateMessageMatch = messageToSend.match(privateMessagePattern)
        let appliedAcls = null

        if (privateMessageMatch !== null) {
            appliedAcls = {
                plusAppliedAcls: [`read_message:user(${mitter.me().identifier})`, `read_message:user(${privateMessageMatch[0]})`]
            }
        }

        this.setState((prevState) => Object.assign({}, prevState, {
            typedMessage: ''
        }))

        this.messageInput.focus()

        mitter.clients().messages()
            .sendMessage(this.state.activeChannel, {
                senderId: mitter.me(),
                textPayload: this.state.typedMessage,
                timelineEvents: [
                    {
                        type: "mitter.mtet.SentTime",
                        eventTimeMs: new Date().getTime(),
                        subject: mitter.me()
                    }
                ],
                appliedAcls: appliedAcls
            })
    }

    updateTypedMessage(evt) {
        const value = evt.target.value
        this.setState((prevState) => {
            return Object.assign({}, prevState, {
                typedMessage: value
            })
        })
    }

    keyPressHandler(evt) {
        if (evt.key === 'Enter') {
            this.sendMessage();
        }
    }

    render() {
        return (
            <div className='chat-parent chat-panel'>
                <div className='channel-list'>
                    { this.renderChannelList() }
                </div>

                <div className='chat-window chat-panel'>
                    <div className='message-container'>
                    { this.renderMessages() }
                    </div>

                    <div className='message-input-box'>
                        <input
                          ref={(input) => { this.messageInput = input }}
                          onChange={this.updateTypedMessage}
                          onKeyPress={this.keyPressHandler}
                          value={this.state.typedMessage}
                          className='message-input'
                          type='text'
                        />

                        &nbsp;

                        <input
                          disabled={this.state.typedMessage.trim() === ''}
                          onClick={this.sendMessage}
                          className='send-message'
                          type='submit'
                          value='Send'
                        />
                    </div>
                </div>
            </div>
        );
    }

    setActiveChannel(channelId) {
        return () => {
            this.setState((prevState) => {
                if (prevState.activeChannel === channelId) {
                    return prevState
                }

                if (this.messageInput !== undefined) {
                    this.messageInput.focus()
                }

                return Object.assign({}, prevState, {
                    activeChannel: channelId,
                    typedMessage: ''
                })
            })
        }
    }
}
