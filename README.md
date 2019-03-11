# mitter-web-starter

Clone this repo:

    git clone https://github.com/mitterio/mitter-web-starter.git

Then install the dependencies using yarn (you can also use npm):

    cd mitter-web-starter
    yarn

Then copy the two files in the `config/` directory:

    mv config/credentials.json.template config/credentials.json
    mv config/config.json.template config/config.json

And edit the two files adding the following data:

**config.json** Add your application id

**credential.json** Add your access key/secret

Once that is done, simply start the server using:

    yarn run


