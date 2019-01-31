const crypto = require('crypto');
const mitter = require('./../clients/mitter');
const mitterAxiosClient = require('./../clients/mitter-axios-client');
const express = require('express');
const router = express.Router();
const constants = require('./../internal/constants');

const mitterUsersClient = mitter.clients().users();

function computePasswordHash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

function setUserPasswordHash(userId, password) {
    return mitterAxiosClient.post(`/v1/users/${userId}/profile/${constants.mitter.PasswordHashAttributeKey}`, {
        key: constants.mitter.PasswordHashAttributeKey,
        value: computePasswordHash(password),
        contentEncoding: 'identity',
        contentType: 'text/plaintext'
    })
    .then(() => console.log('User attribute for password hash created on user'))
}

function getCurrentPasswordHash(userId) {
    return mitterAxiosClient.get(`/v1/users/${userId}/profile/${constants.mitter.PasswordHashAttributeKey}`)
        .then(({ data: [{value}]}) => value);
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
            return setUserPasswordHash(userId, req.body.password).then(() => userId)
        })
        .catch(e => {
            if (e.response.status === 409 && e.response.data.errorCode === 'duplicate_entity') {
                console.log(req.body.userId);
                return setUserPasswordHash(req.body.userId, req.body.password)
                    .then(() => req.body.userId)
            } else {
                throw e;
            }
        })
        .catch(() => res.status(500).send({}))
        .then(mitterUserId => res.status(200).send({
            mitterUserId: mitterUserId
        }));
});

router.post('/:userId/auth', (req, res) => {
    getCurrentPasswordHash(req.params.userId)
        .then(passwordHash => {
            if (computePasswordHash(req.body.password) === passwordHash) {
                res.status(200).send({});
            } else {
                res.status(401).send({});
            }
        })
        .catch(e => {
            res.status(500).send({});
        });
});

router.patch('/:userId', (req, res) => {
    getCurrentPasswordHash(req.params.userId)
        .then(passwordHash => {
            if (computePasswordHash(req.body.oldPassword) === passwordHash) {
                setUserPasswordHash(userId, req.body.newPassword)
                    .then(() => res.status(200).send({}));
            } else {
                res.status(401).send({});
            }
        })
        .catch(() => res.status(500).send({}));
});

module.exports = router;
