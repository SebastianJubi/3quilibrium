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
            dashboard();
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

const dashboard = () => {
  const ONE_DAY = 86400000;
  let reminderStart = +new Date().setHours(0, 0, 0, 0);
  let reminderEnd = reminderStart + ONE_DAY;
  let reminders = [];

  const render = () => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
        <header>
          <div class="logo">
            <img src="${$("#app-loader-3quilibrium").attr("data-logo") || "https://myhappynation.in/3quilibrium/shared/medias/innovaccer.png"}" />
          </div>
          <div class="options">
            <button id="password">Change Password</button>
            <button id="logout">Logout</button>
          </div>
        </header>
        <section class="dashboard-page app-main">
          <section class="dashboard-content">
            <h3>DASHBOARD</h3>
            <section class="content">
              <button id="chat">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--color-theme-text-secondary, #fff)">
                    <path d="M15 4v7H5.17L4 12.17V4h11m1-2H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm5 4h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/>
                  </svg>
                </div>
                Chat<span></span>
              </button>
              <button id="game">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--color-theme-text-secondary, #fff)">
                    <g xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <path d="M21.58,16.09l-1.09-7.66C20.21,6.46,18.52,5,16.53,5H7.47C5.48,5,3.79,6.46,3.51,8.43l-1.09,7.66 C2.2,17.63,3.39,19,4.94,19h0c0.68,0,1.32-0.27,1.8-0.75L9,16h6l2.25,2.25c0.48,0.48,1.13,0.75,1.8,0.75h0 C20.61,19,21.8,17.63,21.58,16.09z M19.48,16.81C19.4,16.9,19.27,17,19.06,17c-0.15,0-0.29-0.06-0.39-0.16L15.83,14H8.17 l-2.84,2.84C5.23,16.94,5.09,17,4.94,17c-0.21,0-0.34-0.1-0.42-0.19c-0.08-0.09-0.16-0.23-0.13-0.44l1.09-7.66 C5.63,7.74,6.48,7,7.47,7h9.06c0.99,0,1.84,0.74,1.98,1.72l1.09,7.66C19.63,16.58,19.55,16.72,19.48,16.81z"/>
                        <polygon points="9,8 8,8 8,10 6,10 6,11 8,11 8,13 9,13 9,11 11,11 11,10 9,10"/>
                        <circle cx="17" cy="12" r="1"/>
                        <circle cx="15" cy="9" r="1"/>
                      </g>
                    </g>
                  </svg>
                </div>
                Games
              </button>
              <button id="music">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--color-theme-text-secondary, #fff)">
                    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zm-7.5-1c1.38 0 2.5-1.12 2.5-2.5V7h3V5h-4v5.51c-.42-.32-.93-.51-1.5-.51-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                  </svg>
                </div>
                Musics
              </button>
              <button id="meditate">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--color-theme-text-secondary, #fff)">
                    <g xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <circle cx="12" cy="6" r="2"/>
                        <path d="M21,16v-2c-2.24,0-4.16-0.96-5.6-2.68l-1.34-1.6C13.68,9.26,13.12,9,12.53,9h-1.05c-0.59,0-1.15,0.26-1.53,0.72l-1.34,1.6 C7.16,13.04,5.24,14,3,14v2c2.77,0,5.19-1.17,7-3.25V15l-3.88,1.55C5.45,16.82,5,17.48,5,18.21C5,19.2,5.8,20,6.79,20H9v-0.5 c0-1.38,1.12-2.5,2.5-2.5h3c0.28,0,0.5,0.22,0.5,0.5S14.78,18,14.5,18h-3c-0.83,0-1.5,0.67-1.5,1.5V20h7.21 C18.2,20,19,19.2,19,18.21c0-0.73-0.45-1.39-1.12-1.66L14,15v-2.25C15.81,14.83,18.23,16,21,16z"/>
                      </g>
                    </g>
                  </svg>
                </div>
                Meditation
              </button>
            </section>
            <section class="reminder">
              <div class="head">
                <span>Reminders</span>
                <button id="add">ADD REMINDER</button>
              </div>
              <div class="options">
                <div>
                  <button id="prev">PREVIOUS</button>
                  <button id="today">TODAY</button>
                  <button id="next">NEXT</button>
                </div>
                <div id="date">${new Date().toDateString()}</div>
              </div>
              <div class="notes"></div>
            </section>
          </section>
        </section>
        <footer>
          Powered by <span class="cologo"><img src="../shared/medias/3quilibrium.png" /></span>
        </footer>`;
    getReminder(reminderStart, reminderEnd);
  };

  const getReminder = (from, to) => {
    console.log("get reminders");
    makeRequest(
      `${BASE_URL}/reminder/api/${window.username}/${from}/${to}`,
      "GET"
    )
      .then((response) => {
        if (response && response.status) {
          console.log("reminders fetched");
          reminders = response.data;
          $("#app-loader-3quilibrium .dashboard-page .reminder .options #date").html(new Date(+from).toDateString());
          $("#app-loader-3quilibrium .dashboard-page .reminder .notes").html(
            reminders
              .map(
                (note) => `
                  <div class="note">
                    <div>
                      <span class="time">${new Date(note.time).toLocaleString()}</span> - <span class="msg">${note.message}</span>
                    </div>
                    <button id="delete" data-id="${note._id}">DELETE</button>
                  </div>`
              )
              .join("") || `<span class="no-reminder">NO REMINDERS</span>`
          );
        } else {
          console.log("reminders NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  window.sendChat = (data) => {
    let _countEl = $(
      "#app-loader-3quilibrium .dashboard-page .content #chat span"
    );
    let _count = +(_countEl.text() || "0");
    _countEl.text(_count + 1);
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

  render();

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

  const changePassword = (oldPass, newPass) => {
    console.log("change password");
    makeRequest(
      `${BASE_URL}/dashboard/api/password/${window.username}`,
      "PATCH",
      { old: oldPass, new: newPass }
    )
      .then((response) => {
        if (response && response.status) {
          console.log("password changed");
          $("#app-loader-3quilibrium .dashboard-page .popup").remove();
        } else {
          console.log("password NOT changed");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const saveReminder = (data) => {
    console.log("save reminder");
    makeRequest(`${BASE_URL}/reminder/api/${window.username}`, "PUT", data)
      .then((response) => {
        if (response && response.status) {
          console.log("reminders saved");
          reminders.push(response.data);
          render();
        } else {
          console.log("reminders NOT saved");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const deleteReminder = (_id) => {
    console.log("delete reminder");
    makeRequest(`${BASE_URL}/reminder/api/${_id}`, "DELETE")
      .then((response) => {
        if (response && response.status) {
          console.log("reminder deleted");
        } else {
          console.log("reminder NOT deleted");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  $(document).on(
    "click",
    "#app-loader-3quilibrium header .options #logout", () => {
      destroySession();
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium header .options #password",
    () => {
      $("#app-loader-3quilibrium .dashboard-page").append(`
        <section class="popup">
          <div class="password">
            <input type="password" id="oldPass" placeholder="Enter old password" />
            <input type="password" id="newPass" placeholder="Enter new password" />
            <input type="password" id="confPass" placeholder="Confirm new password" />
            <button id="update">UPDATE</button>
            <button id="cancel">CANCEL</button>
          </div>
        </section>`);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .popup .password #update",
    () => {
      let _oldPass = $(
        "#app-loader-3quilibrium .dashboard-page .popup .password #oldPass"
      )
        .val()
        .trim();
      let _newPass = $(
        "#app-loader-3quilibrium .dashboard-page .popup .password #newPass"
      )
        .val()
        .trim();
      let _confPass = $(
        "#app-loader-3quilibrium .dashboard-page .popup .password #confPass"
      )
        .val()
        .trim();
      if (_oldPass === _newPass) {
        return alert("New passwords cannot be same as old password");
      }
      if (_newPass !== _confPass) {
        return alert("New passwords and confirmation password do not match");
      }
      if (_oldPass !== _newPass && _newPass === _confPass) {
        changePassword(_oldPass, _newPass);
      }
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .popup .password #cancel",
    () => {
      $("#app-loader-3quilibrium .dashboard-page .popup").remove();
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .content #chat",
    () => {
      location.href = "../chat/";
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .content #game",
    () => {
      location.href = "../game/";
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .content #music",
    () => {
      location.href = "../music/";
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .content #meditate",
    () => {
      location.href = "../meditation/";
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .reminder #add",
    () => {
      $("#app-loader-3quilibrium .dashboard-page").append(`
        <section class="popup">
          <div class="reminder">
            <input type="text" id="reminder-msg" placeholder="Enter reminder message"/>
            <input type="datetime-local" id="datetime" min="${new Date()
          .toISOString()
          .substring(0, 16)}" />
            <button id="save">SAVE</button>
            <button id="exit">CANCEL</button>
          </div>
        </section>`);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .reminder #prev",
    () => {
      reminderStart = reminderStart - ONE_DAY;
      reminderEnd = reminderEnd - ONE_DAY;
      getReminder(reminderStart, reminderEnd);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .reminder #today",
    () => {
      reminderStart = +new Date().setHours(0, 0, 0, 0);
      reminderEnd = reminderStart + ONE_DAY;
      getReminder(reminderStart, reminderEnd);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .reminder #next",
    () => {
      reminderStart = reminderStart + ONE_DAY;
      reminderEnd = reminderEnd + ONE_DAY;
      getReminder(reminderStart, reminderEnd);
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .popup .reminder #save",
    () => {
      let _datetime = $(
        "#app-loader-3quilibrium .dashboard-page .popup #datetime"
      ).val();
      let _message = $(
        "#app-loader-3quilibrium .dashboard-page .popup #reminder-msg"
      )
        .val()
        .trim();
      if (_datetime && _message) {
        if (new Date(_datetime) > new Date()) {
          saveReminder({ time: _datetime, message: _message });
        } else {
          alert("Select date-time later than current date-time");
        }
      }
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .popup .reminder #exit",
    () => {
      $("#app-loader-3quilibrium .dashboard-page .popup").remove();
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .dashboard-page .reminder .notes .note #delete",
    function (e) {
      deleteReminder($(e.target).attr("data-id"));
      $(e.target).parent().remove();
    }
  );
};
