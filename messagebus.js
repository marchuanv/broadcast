const component = require("component");
const utils = require("utils");
const http = require('http');

let subscriptions = [];
let lastIntervalId = 0;

const send = ({ messageId, data } ) => {
    return new Promise(async(resolve, reject) => {
        utils.log("MessageBus","-----------------------------------------------------------");
        utils.log("MessageBus",`subscription count: ${subscriptions.length}`);
        utils.log("MessageBus",`sending data to ${messageId}`);
        const dataToSend = typeof data === "object" ? utils.getJSONString(data) : data;
        const subscription = subscriptions.find(x=>x.id === messageId);
        if (subscription){
            subscription.dataToSend = dataToSend;
            const request = http.request({ 
                host: subscription.host, 
                port: subscription.port, 
                path: subscription.path, 
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataToSend)
                }
            },(response)=>{
                response.setEncoding('utf8');
                let rawData="";
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end', () => {
                    const responseData = utils.getJSONObject(rawData);
                    resolve(responseData);
                });
            });
            request.on('error', (e) => {
                reject(e);
            });
            request.write(dataToSend);
            request.end();
        } else {
            reject(`no subscription found for ${messageId}`);
        }
    });
};
const start = async ( { port }) => {
    await component.startHttpServer(port, ({ path, headers, data }, reply) => {
        utils.log("MessageBus","-----------------------------------------------------------");
        utils.log("MessageBus",`subscription count: ${subscriptions.length}`);
        utils.log("MessageBus",`message received, headers: ${utils.getJSONString(headers)}`);
        const token = headers.token;
        const publickey = headers.publickey;
        let receivedData = utils.getJSONObject(data) || data;
        let subscription = subscriptions.find(x => x.path === path);
        if (subscription){
            utils.log("MessageBus",`updating subscription, received data: `, receivedData);
            subscription.token = token;
            subscription.publickey = publickey;
            subscription.dataReceived = receivedData;
            clearInterval(lastIntervalId);
            lastIntervalId = setInterval(() => {
                let sub = subscriptions.find(x => x.path === path);
                if (sub.dataToSend){
                    clearInterval(lastIntervalId);
                    reply({ contentType: sub.contentType, statusCode: 200, data: sub.dataToSend });
                }
            },1000);
        } else {
            reply({ contentType: "text/plain", statusCode: 404, data: `no subscribers for ${headers.host}${path}`});
        }
        utils.log("MessageBus","-----------------------------------------------------------");
    });
};

const subscribe = ( { messageId, urlPath, host, port, contentType }) => {
    subscriptions = subscriptions.filter(x=>x.id !== messageId);
    subscriptions.push({ id: messageId, path: urlPath, dataToSend: null, dataReceived: null, token: null, publickey: null, host, port, contentType });
};

const receive = ({ messageId }) => {
    return new Promise((resolve, reject) => {
        const subscription = subscriptions.find(x=>x.id === messageId);
        if (subscription){
            const intervalId = setInterval(() => {
                if (subscription.dataReceived){
                    clearInterval(intervalId);
                    resolve(subscription.dataReceived);
                }
            },1000);
        } else {
            reject(`no subscription found for ${messageId}`);
        }
    });
};

module.exports = { subscribe, start, send, receive };