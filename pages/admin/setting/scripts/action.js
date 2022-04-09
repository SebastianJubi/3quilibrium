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
    makeRequest(`${BASE_URL}/admin/api/verifySession`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged in");
          userManagement();
        } else {
          console.log("user NOT logged in");
          location.href = "../";
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  verifySession();
};

//* User Management *//
const userManagement = () => {
  document.getElementById("app-loader-3quilibrium").innerHTML = `
        <header>
          <div class="logo">
            <img src="${$("#app-loader-3quilibrium").attr("data-logo") || "https://myhappynation.in/3quilibrium/shared/medias/innovaccer.png"}" />
          </div>
          <div class="options">
            <button id="logout">Logout</button>
          </div>
        </header>
        <section class="admin-page app-main">
          <h3>SETTINGS</h3>
          <section class="content">
              <div class="menu">
                  <button id="user-management">User Management</button>
                  <button id="setting">Settings</button>
              </div>
          </section>
        </section>
        <footer>
          Powered by <span class="cologo"><img src="../../shared/medias/3quilibrium.png" /></span>
        </footer>`;

  const render = (options) => {
    document.querySelector(
      "#app-loader-3quilibrium .admin-page .content"
    ).innerHTML = `
            <section class="setting">
                <div class="row">
                    <div class="label">Text Color Primary :</div>
                    <div class="input"><input type="color" id="textColorPrimary" value="${options.color.text.primary}" /></div>
                </div>
                <div class="row">
                    <div class="label">Text Color Secondary :</div>
                    <div class="input"><input type="color" id="textColorSecondary" value="${options.color.text.secondary}" /></div>
                </div>
                <div class="row">
                    <div class="label">Button Color Primary :</div>
                    <div class="input"><input type="color" id="buttonColorPrimary" value="${options.color.button.primary}" /></div>
                </div>
                <div class="row">
                    <div class="label">Button Color Secondary :</div>
                    <div class="input"><input type="color" id="buttonColorSecondary" value="${options.color.button.secondary}" /></div>
                </div>
                <div class="row">
                    <div class="label">Opening Hours :</div>
                    <div class="input"><input type="time" id="officeStartTime" value="${options.office.start}" /></div>
                </div>
                <div class="row">
                    <div class="label">Closing Hours :</div>
                    <div class="input"><input type="time" id="officeEndTime" value="${options.office.end}" /></div>
                </div>
                <div class="row">
                    <div class="label">Lunch StartTime :</div>
                    <div class="input"><input type="time" id="lunchStartTime" value="${options.lunch.start}" /></div>
                </div>
                <div class="row">
                    <div class="label">Lunch EndTime :</div>
                    <div class="input"><input type="time" id="lunchEndTime" value="${options.lunch.end}" /></div>
                </div>
                <div class="row">
                    <div class="label">Snacks StartTime :</div>
                    <div class="input"><input type="time" id="snackStartTime" value="${options.snacks.start}" /></div>
                </div>
                <div class="row">
                    <div class="label">Snacks EndTime :</div>
                    <div class="input"><input type="time" id="snackEndTime" value="${options.snacks.end}" /></div>
                </div>
                <div class="row">
                    <div class="label">Complusory Meditation :</div>
                    <div class="input"><input type="checkbox" id="meditate" ${options.meditation ? `checked` : ``}/></div>
                </div>
                <div class="options">
                    <button id="save">Save</button>
                    <button id="cancel">Cancel</button>
                </div>
            </section>
            `;
  };

  //TODO: get settings
  const getSettings = () => {
    console.log("get settings");
    makeRequest(`${BASE_URL}/admin/api/settings`, "GET")
      .then((response) => {
        if (response && response.status) {
          render(response.data);
        } else {
          console.log("settings not found");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  getSettings();

  //TODO: destroy session
  const destroySession = () => {
    console.log("destroy session");
    makeRequest(`${BASE_URL}/admin/api/logout`, "GET")
      .then((response) => {
        if (response && response.status) {
          console.log("user logged out");
          location.href = "../";
        } else {
          console.log("user NOT logged out");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  //TODO: save settings
  const saveSettings = (options) => {
    console.log("save settings");
    makeRequest(`${BASE_URL}/admin/api/settings`, "PATCH", options)
      .then((response) => {
        if (response && response.status) {
          console.log("settings saved");
          location.href = "../";
        } else {
          console.log("settings NOT saved");
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  $(document).on(
    "click",
    "#app-loader-3quilibrium header .options #logout",
    () => {
      destroySession();
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .admin-page .content .setting .options #save",
    () => {
      let _tcp = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #textColorPrimary"
      ).val();
      let _tcs = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #textColorSecondary"
      ).val();
      let _bcp = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #buttonColorPrimary"
      ).val();
      let _bcs = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #buttonColorSecondary"
      ).val();
      let _ost = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #officeStartTime"
      ).val();
      let _oet = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #officeEndTime"
      ).val();
      let _lst = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #lunchStartTime"
      ).val();
      let _let = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #lunchEndTime"
      ).val();
      let _sst = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #snackStartTime"
      ).val();
      let _set = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #snackEndTime"
      ).val();
      let _meditation = $(
        "#app-loader-3quilibrium .admin-page .content .setting .row .input #meditate"
      ).is(":checked");
      if (!_tcp) {
        return alert("Please provide text primary colour");
      }
      if (!_tcs) {
        return alert("Please provide text secondary colour");
      }
      if (!_bcp) {
        return alert("Please provide button primary colour");
      }
      if (!_bcs) {
        return alert("Please provide button secondary colour");
      }
      if (_tcs === _bcp) {
        return alert("Text secondary colour and button primary colour should be different");
      }
      if (!_ost) {
        return alert("Please provide opening office hours");
      }
      if (!_ost) {
        return alert("Please provide closing office hours");
      }
      if (!_lst) {
        return alert("Please provide lunch start time");
      }
      if (!(_ost < _lst && _lst < _oet)) {
        return alert("Please provide lunch start time during office hours");
      }
      if (!_let) {
        return alert("Please provide lunch end time");
      }
      if (!(_ost < _let && _let < _oet)) {
        return alert("Please provide lunch end time during office hours");
      }
      if (!(_lst < _let)) {
        return alert("Lunch start time should be before lunch end time");
      }
      if (!_sst) {
        return alert("Please provide snacks start time");
      }
      if (!(_ost < _sst && _sst < _oet)) {
        return alert("Please provide snacks start time during office hours");
      }
      if (!_set) {
        return alert("Please provide snacks end time");
      }
      if (!(_ost < _set && _set < _oet)) {
        return alert("Please provide snacks end time during office hours");
      }
      if (!(_sst < _set)) {
        return alert("Snacks start time should be before snacks end time");
      }
      if (_ost && _ost && _lst && _let && _sst && _set) {
        saveSettings({
          color: {
            text: {
              primary: _tcp,
              secondary: _tcs
            },
            button: {
              primary: _bcp,
              secondary: _bcs
            }
          },
          office: { start: _ost, end: _oet },
          lunch: { start: _lst, end: _let },
          snacks: { start: _sst, end: _set },
          meditation: _meditation,
        });
      }
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .admin-page .content .setting .options #cancel",
    () => {
      location.href = "../";
    }
  );
};
