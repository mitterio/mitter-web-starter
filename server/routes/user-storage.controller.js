const crypto = require('crypto');
const mitter = require('./../clients/mitter');
const mitterAxiosClient = require('./../clients/mitter-axios-client');
const express = require('express');
const router = express.Router();
const constants = require('./../internal/constants');

const mitterUsersClient = mitter.clients().users();

function setUserPasswordHash(userId, password) {
    mitterAxiosClient.post(`/v1/users/${userId}/profile/${constants.mitter.PasswordHashAttributeKey}`, {
        value: crypto.createHash('md5').update(password).digest('hex'),
        contentEncoding: 'identity',
        contentType: 'text/plaintext'
    })
        .then(() => console.log('User attribute for password hash created on user'))
        .catch(e => console.error(e));
}

router.get('/', (req, res) => {
    mitterUsersClient.getUsers()
        .then(users => {
            const retUsers = users.map(user => {return {
                userId: user.userId
            }});

            res.status(200).send(retUsers);
        });
});

router.post('/', (req, res) => {
    mitterUsersClient.createUser(
        {
            userId: req.body.userId,
            screenName: {
                screenName: req.body.userId
            }
        })
        .then(userId => {
            setUserPasswordHash(userId, req.body.password);
        })
});

module.exports = router;
