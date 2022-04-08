window.socket = io("https://myhappynation.in", { path: "/3quilibrium/socket" });

var sound;
const audio = {
    work: { url: "../shared/medias/work-time.mp3", sound: null },
    water: { url: "../shared/medias/water-time.mp3", sound: null },
    break: { url: "../shared/medias/break-time.mp3", sound: null },
    lunch: { url: "../shared/medias/lunch-time.mp3", sound: null },
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
    switch (data.message) {
        case "water break": type = "water"; break;
        case "work break": type = "break"; break;
        case "work resume": type = "work"; break;
        case "office start": type = "officeStart"; break;
        case "office end": type = "officeEnd"; break;
        case "reminder received": type = "reminder"; break;
        case "lunch break start": type = "lunch"; break;
        case "lunch break end": type = "work"; break;
        case "snacks break start": type = "break"; break;
        case "snacks break end": type = "work"; break;
        default: console.log("unhandled:", data.message); break;
    }
    sound = audio[type].sound;
    sound.play();
    $("#app-loader-3quilibrium").append(`
        <section class="popup">
            <div class="message">
                <pre>${JSON.stringify(data, null, 2)}</pre>
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
    sound = audio[type].sound;
    sound.play();
    if (data.data.from !== data.data.to) {
        window.sendChat(data.data);
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