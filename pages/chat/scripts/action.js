$(document).ready(function () {
  console.log("ready!");
  verifyUser();
});

const makeRequest = (reqUri, reqMethod, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      $.ajax({
        async: true,
        crossDomain: true,
        url: reqUri,
        method: reqMethod,
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "cache-control": "no-cache",
        },
        processData: false,
        data: JSON.stringify(options),
        success: function (resp) {
          if (resp.status) {
            return resolve(resp);
          }
          return resolve(null);
        },
        error: function (err) {
          console.error(err);
          if (err.responseJSON && err.responseJSON.userMessage) {
            alert(err.responseJSON.userMessage);
          }
          return resolve(null);
        },
      });
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });
};

//* Login Page */
const verifyUser = () => {
  //TODO: verify session
  const verifySession = () => {
    console.log("verify session");
    makeRequest(`${BASE_URL}/user/api/verifySession`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged in");
          if (
            response.settings &&
            response.settings.meditation &&
            response.appUser &&
            response.appUser.tags &&
            typeof response.appUser.tags.lastMeditationTime === "number" &&
            response.appUser.tags.lastMeditationTime <
            +new Date().setHours(0, 0, 0, 0)
          ) {
            location.href = "../peace-of-mind/";
          } else {
            window.username = response.appUser.username;
            window.settings = response.settings;
            listenNotifications();
            chatApp();
          }
        } else {
          console.log("user NOT logged in");
          location.href = "../login/";
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const listenNotifications = () => {
    let script = document.createElement("script");
    script.onload = function () {
      console.log("listening for notifications");
    };
    script.src = "../shared/scripts/socket.io.js";
    document.head.appendChild(script);
  };

  verifySession();
};

const chatApp = () => {
  const render = (usernames) => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
        <header>
          <div class="logo">
            <img src="${$("#app-loader-3quilibrium").attr("data-logo") || "https://myhappynation.in/3quilibrium/shared/medias/innovaccer.png"}" />
          </div>
          <div class="options">
            <button id="logout">Logout</button>
          </div>
        </header>
        <section class="chat-page app-main">
          <section class="chat-content">
            <h3>CHAT-APP</h3>
            <section class="content">
              <div class="usernames">
                ${usernames.map((user) => `<button class="user" data-id="${user}">${user}<span></span></button>`).join("")}
              </div>
              <div class="message">
                NO CHAT TO DISPLAY
              </div>
            </section>
          </section>
        </section>
        <footer>
          Powered by <span class="cologo"><img src="../shared/medias/3quilibrium.png" /></span>
        </footer>`;
  };

  const getUsernames = () => {
    makeRequest(`${BASE_URL}/chat/api/usernames`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("usernames fetched");
          render(response.data);
        } else {
          console.log("usernames NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const getMessages = (user) => {
    makeRequest(
      `${BASE_URL}/chat/api/messages/${window.username}/${user}`,
      "GET"
    )
      .then((response) => {
        if (response && response.status) {
          console.log("got usernames");
          $("#app-loader-3quilibrium .chat-page .content .message").html(`
            <div class="chats">
              ${response.data.reverse().map(chat => `
              <div class="chat">
                <div class="bubble ${chat.from === window.username ? 'right' : 'left'}">
                  <div class="msg">${chat.message.replace(/^sos:/i, "🆘")}</div>
                  <div class="time">${new Date(chat.timestamp).toLocaleString()}</div>
                </div>
              </div>
              `).join("")}
            </div>
            <div class="input-box">
              <div><input type="text" id="sms" placeholder="Type your message..." autocomplete="off" /></div>
              <button id="send">Send</button>
            </div>`);
          scroll();
        } else {
          console.log("FAILED getting usernames");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const scroll = () => {
    let el = document.querySelector('body #app-loader-3quilibrium .chat-page .chat-content .content .message .chats');
    el.scrollTop = el.scrollHeight;
  }

  window.sendChat = (data) => {
    if (data.from === document.toUser) {
      $("#app-loader-3quilibrium .chat-page .content .message .chats").append(
        `<div class="chat">
          <div class="bubble ${data.from === window.username ? 'right' : 'left'}">
            <div class="msg">${data.message.replace(/^sos:/i, "🆘")}</div>
            <div class="time">${new Date(data.timestamp).toLocaleString()}</div>
          </div>
        </div>`
      );
      scroll();
    } else {
      let _countEl = $(
        `#app-loader-3quilibrium .chat-page .content .usernames .user[data-id='${data.from}'] span`
      );
      let _count = +(_countEl.text() || "0");
      _countEl.text(_count + 1);
    }
  };

  getUsernames();

  //TODO: destroy session
  const destroySession = () => {
    console.log("destroy session");
    makeRequest(`${BASE_URL}/user/api/logout`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged out");
          location.href = "../login/";
        } else {
          console.log("user NOT logged out");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  $(document).on("click", "#app-loader-3quilibrium header .options #logout", () => {
    destroySession();
  });

  $(document).on(
    "click",
    "#app-loader-3quilibrium .chat-page .content .usernames .user",
    function (e) {
      $("#app-loader-3quilibrium .chat-page .content .usernames .user").removeClass("selected");
      $(e.target).addClass("selected");
      document.toUser = $(e.target).attr("data-id");
      $(
        `#app-loader-3quilibrium .chat-page .content .usernames .user[data-id='${document.toUser}'] span`
      ).text("");
      getMessages(document.toUser);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .chat-page .content .message .input-box #send",
    () => {
      let _msg = $(
        "#app-loader-3quilibrium .chat-page .content .message .input-box div #sms"
      )
        .val()
        .trim();
      if (_msg) {
        $(
          "#app-loader-3quilibrium .chat-page .content .message .input-box div #sms"
        ).val("");
        window.socketEmit("message", {
          from: window.username,
          to: document.toUser,
          message: _msg,
        });
        $("#app-loader-3quilibrium .chat-page .content .message .chats").append(
          // `<pre>${JSON.stringify(
          //   {
          //     from: window.username,
          //     to: document.toUser,
          //     message: _msg,
          //     timestamp: +new Date(),
          //   },
          //   null,
          //   2
          // )}</pre>`
          `<div class="chat">
            <div class="bubble right">
              <div class="msg">${_msg.replace(/^sos:/i, "🆘")}</div>
              <div class="time">${new Date().toLocaleString()}</div>
            </div>
          </div>`
        );
        scroll();
      }
    }
  );

  $(document).on(
    "keyup",
    "#app-loader-3quilibrium .chat-page .content .message .input-box div #sms",
    function (e) {
      if (e.which === 13) {
        $(
          "#app-loader-3quilibrium .chat-page .content .message .input-box #send"
        ).click();
      }
    }
  );
};
