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
}

//* Login Page */
const verifyUser = () => {
  //TODO: verify session
  const verifySession = () => {
    console.log("verify session");
    makeRequest(`${BASE_URL}/dashboard/api/verifySession`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged in");
          if (
            response.settings && response.settings.meditation &&
            response.appUser && response.appUser.tags && typeof response.appUser.tags.lastMeditationTime === "number" &&
            (response.appUser.tags.lastMeditationTime < +new Date().setHours(0, 0, 0, 0))) {
            location.href = "../peace-of-mind/";
          } else {
            window.username = response.appUser.username;
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
    let script = document.createElement('script');
    script.onload = function () {
      console.log("listening for notifications");
    };
    script.src = "../shared/scripts/socket.io.js";
    document.head.appendChild(script);
  }

  verifySession();
};

const dashboard = () => {
  const ONE_DAY = 86400000;
  let reminderStart = +new Date().setHours(0, 0, 0, 0);
  let reminderEnd = reminderStart + ONE_DAY;
  let reminders = [];

  const render = () => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
        <section class="dashboard-page">
            <header>
                <button id="logout">Logout</button>
                <h3>DASHBOARD</h3>
                <button id="password">Change Password</button>
            </header>
            <section class="content">
              <button id="chat">Chat<span></span></button>
              <button id="game">Games</button>
              <button id="music">Musics</button>
              <button id="meditate">Meditation</button>
            </section>
            <section class="reminder">
              <button id="add">ADD REMINDER</button>
              <button id="prev">PREVIOUS</button>
              <button id="today">TODAY</button>
              <button id="next">NEXT</button>
              <div class="notes"></div>
            </section>
        </section>`;
    getReminder(reminderStart, reminderEnd);
  };

  const getReminder = (from, to) => {
    console.log("destroy session");
    makeRequest(`${BASE_URL}/reminder/api/${window.username}/${from}/${to}`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("reminders fetched");
          reminders = response.data;
          $("#app-loader-3quilibrium .dashboard-page .reminder .notes").html(reminders.map((note) => `
              <div class="note">
                <span class="time">${note.time}</span> - <span class="msg">${note.message}</span>
                <button id="delete" data-id="${note._id}">DELETE</button>
              </div>`).join(""));
        } else {
          console.log("reminders NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  window.sendChat = (data) => {
    let _countEl = $("#app-loader-3quilibrium .dashboard-page .content #chat span");
    let _count = +(_countEl.text() || "0");
    _countEl.text(_count + 1);
    $("#app-loader-3quilibrium").append(`
        <section class="popup">
          <div class="message">
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
          <button onclick="$(this).parent().remove();">CLOSE</button>
        </section>`);
  }

  render();

  //TODO: destroy session
  const destroySession = () => {
    console.log("destroy session");
    makeRequest(`${BASE_URL}/dashboard/api/logout`, "GET")
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
    makeRequest(`${BASE_URL}/dashboard/api/password/${window.username}`, "PATCH", { old: oldPass, new: newPass })
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

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page header #logout", () => {
    destroySession();
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page header #password", () => {
    $("#app-loader-3quilibrium .dashboard-page").append(`
        <section class="popup">
          <div class="password">
            <input type="password" id="oldPass" placeholder="Enter old password" />
            <input type="password" id="newPass" placeholder="Enter new password" />
            <input type="password" id="confPass" placeholder="Confirm new password" />
            <button id="update">UPDATE</button>
            <button id="cancel">CANCEL</button>
          </div>
        </section>`)
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .popup .password #update", () => {
    let _oldPass = $("#app-loader-3quilibrium .dashboard-page .popup .password #oldPass").val().trim();
    let _newPass = $("#app-loader-3quilibrium .dashboard-page .popup .password #newPass").val().trim();
    let _confPass = $("#app-loader-3quilibrium .dashboard-page .popup .password #confPass").val().trim();
    if (_oldPass === _newPass) {
      return alert("New passwords cannot be same as old password");
    }
    if (_newPass !== _confPass) {
      return alert("New passwords and confirmation password do not match");
    }
    if (_oldPass !== _newPass && _newPass === _confPass) {
      changePassword(_oldPass, _newPass)
    }
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .popup .password #cancel", () => {
    $("#app-loader-3quilibrium .dashboard-page .popup").remove();
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .content #chat", () => {
    location.href = "../chat/";
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .content #game", () => {
    location.href = "../game/";
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .content #music", () => {
    location.href = "../music/";
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .content #meditate", () => {
    location.href = "../meditation/";
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder #add", () => {
    $("#app-loader-3quilibrium .dashboard-page").append(`
        <section class="popup">
          <div class="reminder">
            <input type="text" id="reminder-msg" placeholder="Enter reminder message"/>
            <input type="datetime-local" id="datetime" min="${new Date().toISOString().substring(0, 16)}" />
            <button id="save">SAVE</button>
            <button id="exit">CANCEL</button>
          </div>
        </section>`);
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder #prev", () => {
    reminderStart = reminderStart - ONE_DAY;
    reminderEnd = reminderEnd - ONE_DAY;
    getReminder(reminderStart, reminderEnd);
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder #today", () => {
    reminderStart = +new Date().setHours(0, 0, 0, 0);
    reminderEnd = reminderStart + ONE_DAY;
    getReminder(reminderStart, reminderEnd);
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder #next", () => {
    reminderStart = reminderStart + ONE_DAY;
    reminderEnd = reminderEnd + ONE_DAY;
    getReminder(reminderStart, reminderEnd);
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .popup .reminder #save", () => {
    let _datetime = $("#app-loader-3quilibrium .dashboard-page .popup #datetime").val();
    let _message = $("#app-loader-3quilibrium .dashboard-page .popup #reminder-msg").val().trim();
    if (_datetime && _message) {
      if (new Date(_datetime) > new Date()) {
        saveReminder({ time: _datetime, message: _message });
      } else {
        alert("Select date-time later than current date-time");
      }
    }
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .popup .reminder #exit", () => {
    $("#app-loader-3quilibrium .dashboard-page .popup").remove();
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder .notes .note #delete", function (e) {
    deleteReminder($(e.target).attr("data-id"));
    $(e.target).parent().remove();
  });
}