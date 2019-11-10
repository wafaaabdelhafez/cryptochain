const PubNub = require('pubnub');

const credintials = {
    publishKey: 'pub-c-ba09a3f3-f719-47b0-ab52-7ca0f593ed2d',
    subscribeKey: 'sub-c-55f2215c-039b-11ea-b6a6-32c7c2eb6eff',
    secretKey: 'sec-c-NTE3M2I5ZDUtZTliOC00YjRiLTlkYjctYmZiNDkyZjBmYTc1'
};

const CHANNELS = {
    TEST: 'TEST',
    TESTTWO: 'TESTTWO'
};

class PubSub {
    constructor() {
        this.pubnub = new PubNub(credintials);

        this.pubnub.subscribe({channels: Object.values(CHANNELS)});

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject;
                console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
            }
        };
    }

    publish({channel, message}) {
        this.pubnub.publish({channel, message});
    }
}

const testPubSub = new PubSub();
testPubSub.publish({channel: CHANNELS.TEST , message: 'hello pubnub'});

module.exports = PubSub;