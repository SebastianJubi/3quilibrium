window.socket = io("https://myhappynation.in", { path: "/3quilibrium/socket" });

var sound;
const audio = {
    work: { url: "../shared/medias/work-time.mp3", sound: null },
    water: { url: "../shared/medias/water-time.mp3", sound: null },
    break: { url: "../shared/medias/break-time.mp3", sound: null },
    lunch: { url: "../shared/medias/lunch-time.mp3", sound: null },
    snack: { url: "../shared/medias/snack-time.mp3", sound: null },
    message: { url: "../shared/medias/message-tone.mp3", sound: null },
    reminder: { url: "../shared/medias/reminder-tone.mp3", sound: null },
    officeStart: { url: "../shared/medias/office-start.mp3", sound: null },
    officeEnd: { url: "../shared/medias/office-end.mp3", sound: null },
};

socket.on("connect", () => {
    console.log("socket connected with id:", socket.id);
    socket.emit("register", { id: socket.id, username: window.username });
});

socket.on("disconnect", (reason) => {
    console.log("socket disconnected due to reason:", reason);
});

socket.on("connect_error", () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

socket.on("notify", (data, callback = null) => {
    console.log("on notify", data);
    let type;
    let text;
    switch (data.message) {
        case "water break":
            type = "water";
            text = "<h4>Water Break</h4><span>Keep Calm and Drink Water!</span>";
            break;
        case "work break":
            type = "break";
            text = "<h4>5mins Work Break</h4><span>Stand up, take a short walk<br/>and stretch.</span>";
            break;
        case "work resume":
            type = "work";
            text = "<h4>Resume Work</h4><span>You can get back to work.</span>";
            break;
        case "office start":
            type = "officeStart";
            text = "<h4>Office Time</h4><span>Have a great day ahead!</span>";
            break;
        case "office end":
            type = "officeEnd";
            text = "<h4>Wrap Up Time</h4><span>Let's head for home!</span>";
            break;
        case "reminder received":
            type = "reminder";
            text = `<h4>Reminder</h4><span>${data.data.message}</span>`;
            break;
        case "lunch break start":
            type = "lunch";
            text = "<h4>Lunch Time</h4><span>Have a great day ahead!</span>";
            break;
        case "lunch break end":
            type = "work";
            text = "<h4>Lunch Time Ends</h4><span>You should head back to work.</span>";
            break;
        case "snacks break start":
            type = "snack";
            text = "<h4>Tea/Coffee Break</h4><span>Taste of relaxation!</span>";
            break;
        case "snacks break end":
            type = "work";
            text = "<h4>Snack Time Over</h4><span>Time to start working again.</span>";
            break;
        default:
            console.log("unhandled:", data.message);
            break;
    }
    sound = audio[type].sound;
    sound.play();
    //  <pre>${JSON.stringify(data, null, 2)}</pre>
    $("#app-loader-3quilibrium").append(`
        <section class="popup">
            <div class="tile">
                <div class="image"><img src="../shared/medias/${type}.png" /></div>
                <div class="text">${text}</div>
            </div>
            <button onclick="$(this).parent().remove();sound.pause();sound.currentTime=0;">X</button>
        </section>`);
    if (callback) {
        callback("received");
    }
});

socket.on("message", (data, callback = null) => {
    console.log("on message", data);
    let type;
    switch (data.message) {
        case "Message received": type = "message"; break;
        default: console.log("unhandled:", data.message); break;
    }
    if (window.settings.office.start <= new Date().toTimeString().substring(0, 5) && new Date().toTimeString().substring(0, 5) < window.settings.office.end) {
        sound = audio[type].sound;
        sound.play();
        if (data.data.from !== data.data.to) {
            window.sendChat(data.data);
        }
    } else if (data.data.message.toLowerCase().startsWith("sos:")) {
        sound = audio[type].sound;
        sound.play();
        if (data.data.from !== data.data.to) {
            window.sendChat(data.data);
        }
    }
    if (callback) {
        callback("received");
    }
});

window.socketEmit = (type, data = {}) => socket.emit(type, data);

$(document).ready(function () {
    console.log("socket ready");
    Object.keys(audio).forEach((type) => {
        audio[type].sound = document.createElement('audio');
        audio[type].sound.src = audio[type].url;
        audio[type].sound.type = 'audio/mpeg';
    });
});

{/* 
<section class="popup">
    <div class="message">
        <pre>
            {
                "type": "reminder",
                "message": "reminder received",
                "data": {
                    "_id": "62515cdf6cd3a45a5725b15f",
                "username": "sebastian",
                "message": "Custom Reminder 2",
                "time": "2022-04-09T10:16:00.000Z",
                "timestamp": 1649493771707,
                "__v": 0
                }
            }
        </pre>
    </div>
    <button onclick="$(this).parent().remove();sound.pause();sound.currentTime=0;">X</button>
</section> 
*/}