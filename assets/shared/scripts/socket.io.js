window.socket = io("https://myhappynation.in", { path: "/3quilibrium/socket" });

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

socket.on("data", (data, callback = null) => {
    console.log("on data", data);
    if (callback) {
        callback("received");
    }
});

socket.on("notify", (data, callback = null) => {
    console.log("on notify", data);
    if (callback) {
        callback("received");
    }
});

socket.on("message", (data, callback = null) => {
    console.log("on message", data);
    if (data.data.from !== data.data.to) {
        window.sendChat(data.data);
    }
    if (callback) {
        callback("received");
    }
});

window.socketEmit = (type, data = {}) => socket.emit(type, data);