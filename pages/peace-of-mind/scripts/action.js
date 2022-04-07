var player;
var url = "";
var firstFlag = false;
const BASE_URL = "https://myhappynation.in/3quilibrium";

verifySession();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function makeRequest(reqUri, reqMethod, options = {}) {
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
}

function verifySession() {
  console.log("verify session");
  makeRequest(`${BASE_URL}/user/api/verifySession`, "GET")
    .then((response) => {
      if (response && response.status) {
        console.log("user logged in");
        window.username = response.appUser.username;
        getMeditation();
      } else {
        console.log("user NOT logged in");
        location.href = "../login/";
      }
    })
    .catch((e) => {
      console.error(e);
    });
}

function getMeditation() {
  console.log("get meditation");
  makeRequest(`${BASE_URL}/meditation/api/material`, "GET")
    .then((response) => {
      if (response && response.status) {
        console.log("meditation material fetched");
        url = response.data;
        let script = document.createElement("script");
        script.onload = function () {
          console.log("loaded yt player script");
        };
        script.src = "https://www.youtube.com/player_api";
        document.head.appendChild(script);
      } else {
        console.log("meditation material NOT fetched");
      }
    })
    .catch((e) => {
      console.error(e);
    });
}

function onYouTubePlayerAPIReady() {
  player = new YT.Player("player", {
    height: "640",
    width: "320",
    playerVars: {
      playsinline: 1,
      controls: 1,
      rel: 0,
    },
    videoId: `${url.split("/").pop()}`,
    events: {
      onReady: getDuration,
      onStateChange: onPlayerStateChange,
    },
  });
}

function getDuration(event) {
  event.target.playVideo();
  // console.log(player.getDuration());
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    console.log("video ended");
    $("body").append(`
            <section class="popup">
              <div class="content">
                <div class="input">
                  <input type="text" id="code" maxlength="4" />
                </div>
                <button id="submit">SUBMIT</button>
                <button id="restart">MEDITATE AGAIN</button>
              </div>
            </section>`);
  }
  if (event.data === 1 && !firstFlag) {
    firstFlag = true;
    const duration = player.getDuration();
    const timer = getRandomInt(0.1 * duration, 0.9 * duration) * 1000;
    const code = String(Math.floor(Math.random() * 10000)).padStart(
      4,
      "0"
    );
    console.log({ duration, timer, code });
    setTimeout(() => {
      console.log("trigger event", code);
    }, timer);
    $(document).on("click", "body .popup .content #submit", () => {
      let _code = $("body .popup .content .input #code").val().trim();
      if (_code == code) {
        console.log("PASSED");
        makeRequest(
          `${BASE_URL}/meditation/api/complete/${window.username}`,
          "GET"
        )
          .then((response) => {
            if (response && response.status) {
              console.log("meditation completed");
              location.href = "../dashboard/";
            } else {
              console.log("meditation NOT completed");
            }
          })
          .catch((e) => {
            console.error(e);
          });
      } else {
        console.log("FAILED");
        alert("Please enter the correct code or retake meditation");
        $("body .popup .content .input #code").val("");
      }
    });
    $(document).on("click", "body .popup .content #restart", () => {
      firstFlag = false;
      $("body .popup").remove();
      player.playVideo();
    });
  }
}