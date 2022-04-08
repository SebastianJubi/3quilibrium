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
            listenNotifications();
            game();
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

const game = () => {
  const render = (url) => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
      <header>
        <div class="logo">
          <img src="../shared/medias/innovaccer.png" />
        </div>
        <div class="options">
          <button id="logout">Logout</button>
        </div>
      </header>
      <section class="game-page app-main">
        <section class="contents">
          <div class="frame">
            <iframe title="Game" role="region"  class="PlayGame-iframe"
              aria-label="GameSnacks games are touch-based and focus on quick action. Tap to play."
              src="${url}">
            </iframe>
          </div>
        </section>
      </section>
      <footer>
          Powered by <span class="cologo"><img src="../shared/medias/3quilibrium.png" /></span>
      </footer>`;
  };

  const getGameContent = () => {
    console.log("get games");
    makeRequest(`${BASE_URL}/game/api/material`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("game contents fetched");
          render(response.data);
        } else {
          console.log("game contents NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  window.sendChat = (data) => {
    $("#app-loader-3quilibrium").append(`
        <section class="popup">
          <div class="message">
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
          <button onclick="$(this).parent().remove();">X</button>
        </section>`);
  };

  getGameContent();

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
