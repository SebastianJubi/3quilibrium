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
    makeRequest(`${BASE_URL}/user/api/verifySession`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged in");
          window.username = response.appUser.username;
          listenNotifications();
          dashboard();
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
  let reminders = [];

  const render = () => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
        <section class="dashboard-page">
            <header>
                <button id="logout">Logout</button>
                <h3>DASHBOARD</h3>
            </header>
            <section class="content">
              <button id="chat">Chat</button>
              <button id="song">Songs</button>
              <button id="game">Games</button>
              <button id="meditate">Meditation</button>
            </section>
            <section class="reminder">
              <button id="add">ADD REMINDER</button>
              <div class="today">
                ${reminders.map((note) => `
                  <div class="note">
                    <span class="time">${note.time}</span> - <span class="msg">${note.message}</span>
                    <button id="delete" data-id="${note._id}">DELETE</button>
                  </div>
                  `).join("")}
              </div>
            </section>
        </section>`;
  };

  const getReminder = () => {
    console.log("destroy session");
    makeRequest(`${BASE_URL}/reminder/api/${window.username}`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("reminders fetched");
          reminders = response.data;
          render();
        } else {
          console.log("reminders NOT fetched");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  getReminder();

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

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .content #chat", () => {
    location.href = "../chat/";
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder #add", () => {
    $("#app-loader-3quilibrium .dashboard-page").append(`
        <section class="popup">
          <input type="text" id="reminder-msg" />
          <input type="datetime-local" id="datetime" />
          <button id="save">SAVE</button>
        </section>`)
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .popup #save", () => {
    let _datetime = $("#app-loader-3quilibrium .dashboard-page .popup #datetime").val();
    let _message = $("#app-loader-3quilibrium .dashboard-page .popup #reminder-msg").val().trim();
    if (_datetime && _message) {
      saveReminder({ time: _datetime, message: _message });
    }
  });

  $(document).on("click", "#app-loader-3quilibrium .dashboard-page .reminder .today .note #delete", function (e) {
    deleteReminder($(e.target).attr("data-id"));
    $(e.target).parent().remove();
  });
}