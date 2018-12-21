const axios = require('axios');
const mitter = require('./../clients/mitter');

const mitterAxiosClient = axios.create({
    baseURL: 'https://api.mitter.io'
});

mitter.enableAxiosInterceptor(mitterAxiosClient);

module.exports = mitterAxiosClient;
