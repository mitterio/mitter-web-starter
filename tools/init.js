var opn = require('opn');
var clipboardy = require('clipboardy');

function monitorClipboard(predicate, timeout, defaultValue) {
    function generatePayload(value, timedout) {
        return { value, timedout };
    }

    return new Promise((resolve, reject) => {
        let timeoutHandle = setTimeout(
            () => resolve(generatePayload(defaultValue, true)), timeout
        );

        let intervalHandle = setInterval(() => {
            let clipboardValue = clipboardy.readSync();
            
            try {
                if (predicate(clipboardValue) === true) {
                    clearInterval(intervalHandle);
                    clearTimeout(timeoutHandle);
                    resolve(generatePayload(clipboardValue, false));
                }
            } catch(e) {
                clearInterval(intervalHandle);
                clearTimeout(timeoutHandle);
                
                reject(e);
            }
        }, 500);
    });
}

/*
function main() {
    monitorClipboard((val) => val.match(/^([A-Za-z0-9]{5}-){3}[A-Za-z0-9]{5}$/g) !== null, 20000, null)
        .then((clipVal) => console.log(clipVal));
}

main();

opn('https://mitter.io/auth');
// console.log('Welcome to mitter.io!');
*/

