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
            <img src="../../shared/medias/innovaccer.png" />
          </div>
          <div class="options">
            <button id="logout">Logout</button>
          </div>
        </header>
        <section class="admin-page app-main">
            <section class="content"></section>
        </section>
        <footer>
          Powered by <span class="cologo"><img src="../../shared/medias/3quilibrium.png" /></span>
        </footer>`;

  const render = () => {
    document.querySelector(
      "#app-loader-3quilibrium .admin-page .content"
    ).innerHTML = `
            <header>
                <h3 class="label">ALL USERS</h3>
                <button id="add-user">Add User</button>
            </header>
            <section class="table">
                <span>No User Found!</span>
            </section>
            `;
    renderUsernames();
  };

  const renderUsernames = () => {
    getUsernames()
      .then((userlist) => {
        if (userlist.length > 0) {
          document.querySelector(
            "#app-loader-3quilibrium .admin-page .content .table"
          ).innerHTML = `
                        ${userlist
              .map((username) => {
                return `<div class="user" data-id="${username}">
                                            <div class="name">${username}</div>
                                            <button id="delete">DELETE</button>
                                        </div>`;
              })
              .join("")}
                        `;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const getUsernames = () => {
    console.log("get usernames");
    return new Promise((resolve, reject) => {
      try {
        makeRequest(`${BASE_URL}/admin/api/usernames`, "GET")
          .then((response) => {
            if (response && response.status) {
              return resolve(response.data);
            } else {
              return resolve([]);
            }
          })
          .catch((e) => {
            console.error(e);
          });
      } catch (e) {
        console.error(e);
        return reject(e);
      }
    });
  };

  const addUsername = (username) => {
    console.log(`add username : ${username}`);
    return new Promise((resolve, reject) => {
      try {
        makeRequest(`${BASE_URL}/admin/api/add/${username}`, "PUT")
          .then((response) => {
            if (response && response.status) {
              $("#app-loader-3quilibrium .admin-page .content .table").prepend(`
                                    <div class="user" data-id="${username}">
                                        <div class="name">${username}</div>
                                        <button id="delete">DELETE</button>
                                    </div>`);
            }
          })
          .catch((e) => {
            console.error(e);
          });
      } catch (e) {
        console.error(e);
        return reject(e);
      }
    });
  };

  const deleteUsername = (username, htmlObject) => {
    console.log(`delete username : ${username}`);
    return new Promise((resolve, reject) => {
      try {
        makeRequest(`${BASE_URL}/admin/api/delete/${username}`, "DELETE")
          .then((response) => {
            if (response && response.status) {
              htmlObject.remove();
            }
          })
          .catch((e) => {
            console.error(e);
          });
      } catch (e) {
        console.error(e);
        return reject(e);
      }
    });
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
    "#app-loader-3quilibrium .admin-page .content header #add-user",
    function (e) {
      let _username = prompt("Enter username");
      addUsername(_username.trim().toLowerCase());
    }
  );

  $(document).on(
    "click",
    "#app-loader-3quilibrium .admin-page .content .table .user #delete",
    function (e) {
      let _username = $(e.target).parent().attr("data-id");
      deleteUsername(_username, $(e.target).parent());
    }
  );
};
