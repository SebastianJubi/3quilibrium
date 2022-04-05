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
    const render = () => {
        document.getElementById("app-loader-3quilibrium").innerHTML = `
        <section class="login-page">
            <div class="login-content">
                <h3>Login</h3>
                <div class="username">
                    <input id="username" type="text" placeholder="Email ID" />
                </div>
                <div class="password">
                    <input id="password" type="password" placeholder="Password" />
                </div>
                <button id="login">Login</button>
            </div>
        </section>`;
    };

    //TODO: verify session
    const verifySession = () => {
        console.log("verify session");
        makeRequest(`${BASE_URL}/admin/api/verifySession`, "GET")
            .then((response) => {
                if (response && response.status) {
                    console.log("user logged in");
                    location.href = "./home/";
                } else {
                    console.log("user NOT logged in");
                    render();
                }
            })
            .catch((e) => {
                console.error(e);
            });
    };

    //TODO: create session
    const createSession = (options) => {
        console.log("create session");
        makeRequest(`${BASE_URL}/admin/api/createSession`, "POST", options)
            .then((response) => {
                if (response && response.status) {
                    console.log("session created");
                } else {
                    console.log("session NOT created");
                }
            })
            .catch((e) => {
                console.error(e);
            });
    };

    //TODO: login user
    const verifyCreds = (creds) => {
        console.log("verify creds");
        makeRequest(`${BASE_URL}/admin/api/login`, "POST", creds)
            .then((response) => {
                if (response && response.status) {
                    console.log("user logged in");
                    createSession({ appUser: response.data, token: response.token });
                    location.href = "./home/";
                } else {
                    console.log("user NOT logged in");
                    render();
                }
            })
            .catch((e) => {
                console.error(e);
            });
    }

    verifySession();

    $(document).on("click", "#app-loader-3quilibrium .login-page #login", () => {
        let _username = $("#app-loader-3quilibrium .login-page #username").val().trim();
        let _password = $("#app-loader-3quilibrium .login-page #password").val().trim();
        if (!_username) {
            return alert("Please provide username");
        }
        if (!_password) {
            return alert("Please provide password");
        }
        if (_username && _password) {
            verifyCreds({ username: _username, password: _password })
        }
    });
};
