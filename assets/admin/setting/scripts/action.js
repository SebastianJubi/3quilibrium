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
}

//* Login Page */
const verifyUser = async () => {
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
        <section class="admin-page">
            <header>
                <button id="logout">Logout</button>
            </header>
            <section class="content">
                <div class="menu">
                    <button id="user-management">User Management</button>
                    <button id="setting">Settings</button>
                </div>
            </section>
        </section>`;

    const render = (options) => {
        document.querySelector("#app-loader-3quilibrium .admin-page .content").innerHTML = `
            <section class="setting">
                <div class="row">
                    <div class="label">Opening Hours :</div>
                    <div class="input"><input type="time" id="oHours" value="${options.open}" /></div>
                </div>
                <div class="row">
                    <div class="label">Closing Hours :</div>
                    <div class="input"><input type="time" id="cHours" value="${options.close}" /></div>
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
    }

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

    $(document).on("click", "#app-loader-3quilibrium .admin-page header #logout", () => {
        destroySession();
    });

    $(document).on("click", "#app-loader-3quilibrium .admin-page .content .setting .options #save", function (e) {
        let _open = $("#app-loader-3quilibrium .admin-page .content .setting .row .input #oHours").val();
        let _close = $("#app-loader-3quilibrium .admin-page .content .setting .row .input #cHours").val();
        let _meditation = $("#app-loader-3quilibrium .admin-page .content .setting .row .input #meditate").is(":checked");
        if (!_open) {
            return alert("Please provide opening hours");
        }
        if (!_close) {
            return alert("Please provide closing hours");
        }
        if (_open && _close) {
            saveSettings({ open: _open, close: _close, meditation: _meditation });
        }
    });

    $(document).on("click", "#app-loader-3quilibrium .admin-page .content .setting .options #cancel", function (e) {
        location.href = "../";
    });
}