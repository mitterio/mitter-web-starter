var credentials = require('./../../config/credentials.json');
var config = require('./../../config/config.json');
var process = require('process');
var express = require('express');
var router = express.Router();
var Mitter = require('@mitter-io/node').Mitter;

const mitter = Mitter.forNode(
    config.mitterApplicationId,
    {
        accessKey: credentials.mitterAccessKey,
        accessSecret: credentials.mitterAccessSecret
    }
);

const userAuthClient = mitter.clients().userAuth();
const userClient = mitter.clients().users();

const Users = {
  '@john': {
    name: 'John Doe'
  },

  '@amy': {
    name: 'Amy'
  },

  '@candice': {
      name: 'Candice'
  }
}

function loginSuccessfulResponse(res, userId, userToken) {
    res.status(200).send({
        mitterUserId: userId,
        mitterUserAuthorization: userToken
  })
}

router.get('/', function(req, res) {
    res.status(200).send(Object.keys(Users));
})

router.post('/login', async function(req, res, next) {
    const { username } = req.body;
    console.log(req.body);
    const userFound = Object.keys(Users).find((userId) => {
        return username === userId;
    })

    if (userFound) {
        const createUser = userClient.createUser({
            userId: userFound,
            userLocators: [],
            systemUser: false,
            screenName: {
                screenName: Users[userFound].name
            }
        })
        .catch((e) => {
            if (!(e.response.status === 409 && e.response.data.errorCode === 'duplicate_entity')) {
              throw e;
            }
        })

        createUser.then(() => userAuthClient.getUserToken(userFound))
            .then(token => {
                loginSuccessfulResponse(res, userFound, token.userToken.signedToken);
            })
            .catch(e => {
                console.error('Error executing request, setting 500', e);
                res.sendStatus(500);
            })
    } else {
        res.sendStatus(401);
        return Promise.resolve();
    }
});

module.exports = router;
