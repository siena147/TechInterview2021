let ws = null;
let startDate = Date.now();


const connect = () => {
    ws = new WebSocket('ws://localhost:8081');
    ws.onmessage = (msg) => {
        const reviews = JSON.parse(msg.data);
        for (let top3Revews of reviews) {
            document.querySelector(".top3history").innerHTML += document.querySelector(".currentTop3").innerHTML
            document.querySelector(".currentTop3").innerHTML = getReviewsTxt(top3Revews.reviews)
        }
    }
    ws.onclose = () =>
        setTimeout(connect, 1000)

    ws.onopen = () => {
        ws.send(startDate);
    }

}
connect();


const getReviewsTxt = (reviews) => {
    let txt = '';
    for (let review of reviews)
        txt += `
        <div class="review">
            <h2>${review.name} on ${new Date(review.date)}</h2>
            <h3>${review.body}</h3>
        </div>
        <hr/>
        `
    return txt;

}