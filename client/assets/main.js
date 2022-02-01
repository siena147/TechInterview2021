const action = function() {
    // implement me : add js to fit the requirements
    console.log("implement me");
    
    ws && ws.send("task");
    manualGetTop3();
}

const ws = new WebSocket('ws://localhost:8081');
ws.onopen = (evt) => {
    console.log("ws open", evt);
};
ws.onmessage = (msg) => {
    // implement me
    console.log("got", msg);
}

const manualGetTop3 = () => {
    // implement me
    console.log("manual call");
}
