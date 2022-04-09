$(document).ready(function () {
  console.log("ready!");
  verifyUser();
});

const makeRequest = (reqUri, reqMethod, options = {}) => {
  return new Promise(async (resolve, reject) => {
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
const verifyUser = async () => {
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
            music();
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

const music = () => {
  const render = (urls) => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
      <header>
          <div class="logo">
            <img src="${$("#app-loader-3quilibrium").attr("data-logo") || "https://myhappynation.in/3quilibrium/shared/medias/innovaccer.png"}" />
          </div>
          <div class="options">
            <button id="logout">Logout</button>
          </div>
      </header>
      <section class="music-page app-main">
        <section class="contents">
           ${urls
        .map(
          (url) => `
          <div class="frame">
            <iframe id="ytplayer" type="text/html" width="640" height="360"
              src="${url}?enablejsapi=1&version=3&playerapiid=ytplayer&autoplay=0&showinfo=0&controls=1&modestbranding=1&rel=1" 
              frameborder="0"allowfullscreen >
            </iframe>
          </div>`
        )
        .join("")}
        </section>
      </section>
      <footer>
          Powered by <span class="cologo"><img src="../shared/medias/3quilibrium.png" /></span>
      </footer>`;
  };

  const getMusicContent = () => {
    console.log("get music");
    makeRequest(`${BASE_URL}/music/api/contents`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("music contents fetched");
          render(Object.values(response.data));
        } else {
          console.log("music contents NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  window.sendChat = (data) => {
    $("#app-loader-3quilibrium").append(`
        <section class="popup">
            <div class="tile">
                <div class="image"><img src="../shared/medias/chat.png" /></div>
                <div class="text">
                  <h4>New Message</h4>
                  <span><b>${data.from}</b> : ${data.message.replace(/^sos:/i, "🆘")}</span>
                </div>
            </div>
            <button onclick="$(this).parent().remove();sound.pause();sound.currentTime=0;">X</button>
        </section>`);
  };

  getMusicContent();

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
};
