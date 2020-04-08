const messagebus = require("./messagebus.js");
(async()=>{
    await messagebus.start( { port: 3000 });
    const subscription = messagebus.subscribe( { 
        messageId: "test", 
        urlPath:"/test", 
        destinationHost: "localhost", 
        destinationPort: 3000, 
        contentType: "text/html" 
    });
    subscription.onreceive = (receivedMsg) => {
        console.log("received message: ", receivedMsg);
    };
    await messagebus.publish({ messageId: "test", data: '<html><head></head><body>FIRST</body></html>' });

})().catch((err)=>{
    console.log(err);
});