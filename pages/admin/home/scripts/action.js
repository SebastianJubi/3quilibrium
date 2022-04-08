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
          configure();
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

//* Enterprise Configurations *//
const configure = () => {
  const render = () => {
    document.getElementById("app-loader-3quilibrium").innerHTML = `
        <header>
          <div class="logo">
            <img src="../../shared/medias/innovaccer.png" />
          </div>
          <div class="options">
            <button id="logout">Logout</button>
          </div>
        </header>
        <section class="admin-page app-main">
          <h3>ADMIN PANEL</h3>
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
  };

  render();

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

  $(document).on(
    "click",
    "#app-loader-3quilibrium header .options #logout",
    () => {
      destroySession();
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .admin-page .content .menu #user-management",
    () => {
      location.href = "../user-management/";
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .admin-page .content .menu #setting",
    () => {
      location.href = "../setting/";
    }
  );
};
