import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Userboard from './Userboard';
import config from './config.alias.json';
import registerServiceWorker from './registerServiceWorker';
import { Mitter } from '@mitter-io/web';

const regex = /^\/user\/(@[a-zA-Z0-9-]+)/
const userPatternMatch = (new URL(document.location.href).pathname.match(regex))

if (userPatternMatch !== null) {
    const loggedUser = (new URL(document.location.href).pathname.match(regex)[1])
    const mitter = Mitter.forWeb({
          applicationId: config.mitterApplicationId,
          mitterApiBaseUrl: config.mitterApiUrl || 'https://api.mitter.io',
          weaverUrl: config.weaverUrl ||  'wss://weaver.mitter.io/',
          initMessagingPipelineSubscriptions: [],
          disableXHRCaching: true
        }
    )

    ReactDOM.render(
        <App
          mitter={mitter}
          loggedUser={loggedUser}
        />,
        document.getElementById('root')
    );
} else {
    ReactDOM.render(
        <Userboard />,
        document.getElementById('root')
    )
}

registerServiceWorker();
