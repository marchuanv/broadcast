const messagebus = require("./messagebus.js");
(async()=>{
    await messagebus.start( { port: 3000 });
    const subscription = messagebus.subscribe( { 
        messageId: "test", 
        urlPath:"/test", 
        contentType: "text/html" 
    });
    subscription.onreceive = (receivedMsg) => {
        console.log("received message: ", receivedMsg);
    };
    await messagebus.publish({ messageId: "test", host: "localhost", port: 3000, data: '<html><head></head><body>FIRST</body></html>' });

})().catch((err)=>{
    console.log(err);
});