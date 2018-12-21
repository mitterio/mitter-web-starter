const mitterAxiosClient = require('./../clients/mitter-axios-client');
const bootstrapLockfileLocation = './.bootstrap.lock';
const touch = require('touch');
const fs = require('fs');

const constants = require('./../internal/constants');

function createMitterUserProfileAttributes() {
    /*
    mitterAxiosClient.get('/v1/attribute-def/users')
        .then(x => console.log(x.data.filter(y => y.key.startsWith("my-app"))))
        .catch(e => console.error(e));
    */

    mitterAxiosClient.post('/v1/attribute-def/users', {
        key: constants.mitter.PasswordHashAttributeKey,
        canBeEmpty: true,
        allowedContentTypes: ['text/plaintext'],
        allowedContentEncodings: ['identity'],
        entityType: 'users'
    })
        .then(() => console.log('User attribute for password hash created on user'))
        .catch(e => console.error(e));
}

if (!fs.existsSync(bootstrapLockfileLocation)) {
    createMitterUserProfileAttributes();
    touch(bootstrapLockfileLocation);
}
