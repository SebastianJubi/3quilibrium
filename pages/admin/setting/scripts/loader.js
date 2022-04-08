"use strict";

const BASE_URL = "https://myhappynation.in/3quilibrium";

function get(name) {
    if (
        (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
            location.search
        ))
    ) {
        return decodeURIComponent(name[1]);
    }
    return;
}

function load(e, t) {
    return new Promise(function (r, a) {
        (t.onload = t.onreadystatechange =
            function () {
                var e = !1;
                if (!(e || (this.readyState && "complete" != this.readyState)))
                    return (e = !0), r();
            }),
            (t.onerror = function (e) {
                return a(e);
            }),
            e.appendChild(t);
    });
}

async function loadJs(e) {
    var t = !0,
        r = !1,
        a = void 0,
        n = document.getElementsByTagName("head")[0];
    try {
        for (
            var o, i = Object.keys(e)[Symbol.iterator]();
            !(t = (o = i.next()).done);
            t = !0
        ) {
            var c = e[o.value];
            if (!isMyScriptLoaded(c)) {
                var s = document.createElement("script");
                (s.type = "text/javascript"),
                    (s.src = c),
                    (s.defer = !0),
                    await load(n, s);
            }
        }
    } catch (e) {
        (r = !0), (a = e);
    } finally {
        try {
            !t && i.return && i.return();
        } finally {
            if (r) throw a;
        }
    }
}

function isMyScriptLoaded(e) {
    for (var t = document.getElementsByTagName("script"), r = t.length; r--;)
        if (t[r].src == e) return !0;
    return !1;
}

function isMyCssLoaded(e) {
    for (var t = document.getElementsByTagName("link"), r = t.length; r--;)
        if (t[r].src == e) return !0;
    return !1;
}

async function loadCss(e) {
    var t = !0,
        r = !1,
        a = void 0;
    try {
        for (
            var n, o = Object.keys(e)[Symbol.iterator]();
            !(t = (n = o.next()).done);
            t = !0
        ) {
            var i = e[n.value];
            if (!isMyCssLoaded(i)) {
                var c = document.getElementsByTagName("head")[0],
                    s = document.createElement("link");
                (s.rel = "stylesheet"),
                    (s.type = "text/css"),
                    (s.href = i),
                    (s.media = "all"),
                    (s.async = !0),
                    (s.defer = !0),
                    await load(c, s);
            }
        }
    } catch (e) {
        (r = !0), (a = e);
    } finally {
        try {
            !t && o.return && o.return();
        } finally {
            if (r) throw a;
        }
    }
}

document.getElementById("app-loader-3quilibrium").innerHTML = `
<div id="loading" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;z-index: 3;">
    <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
        <img src="../../shared/medias/loading.gif" width="200px" />
    </div>
</div>
`;

loadCss({
    font: "https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap",
    frame: "../../shared/styles/style.css",
    style: "./styles/style.css",
});

loadJs({
    jquery: "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js",
    script: "./scripts/action.js",
});