(function () {
  'use strict';
  var Z =
      typeof globalThis < 'u'
        ? globalThis
        : typeof window < 'u'
          ? window
          : typeof global < 'u'
            ? global
            : typeof self < 'u'
              ? self
              : {},
    G = { exports: {} };
  (function (s, a) {
    (function (n, f) {
      f(s);
    })(typeof globalThis < 'u' ? globalThis : typeof self < 'u' ? self : Z, function (n) {
      if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id))
        throw new Error('This script should only be loaded in a browser extension.');
      if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)
        n.exports = globalThis.browser;
      else {
        const f = 'The message port closed before a response was received.',
          c = u => {
            const v = {
              alarms: {
                clear: { minArgs: 0, maxArgs: 1 },
                clearAll: { minArgs: 0, maxArgs: 0 },
                get: { minArgs: 0, maxArgs: 1 },
                getAll: { minArgs: 0, maxArgs: 0 },
              },
              bookmarks: {
                create: { minArgs: 1, maxArgs: 1 },
                get: { minArgs: 1, maxArgs: 1 },
                getChildren: { minArgs: 1, maxArgs: 1 },
                getRecent: { minArgs: 1, maxArgs: 1 },
                getSubTree: { minArgs: 1, maxArgs: 1 },
                getTree: { minArgs: 0, maxArgs: 0 },
                move: { minArgs: 2, maxArgs: 2 },
                remove: { minArgs: 1, maxArgs: 1 },
                removeTree: { minArgs: 1, maxArgs: 1 },
                search: { minArgs: 1, maxArgs: 1 },
                update: { minArgs: 2, maxArgs: 2 },
              },
              browserAction: {
                disable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: !0 },
                enable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: !0 },
                getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                getBadgeText: { minArgs: 1, maxArgs: 1 },
                getPopup: { minArgs: 1, maxArgs: 1 },
                getTitle: { minArgs: 1, maxArgs: 1 },
                openPopup: { minArgs: 0, maxArgs: 0 },
                setBadgeBackgroundColor: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setBadgeText: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setIcon: { minArgs: 1, maxArgs: 1 },
                setPopup: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setTitle: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
              },
              browsingData: {
                remove: { minArgs: 2, maxArgs: 2 },
                removeCache: { minArgs: 1, maxArgs: 1 },
                removeCookies: { minArgs: 1, maxArgs: 1 },
                removeDownloads: { minArgs: 1, maxArgs: 1 },
                removeFormData: { minArgs: 1, maxArgs: 1 },
                removeHistory: { minArgs: 1, maxArgs: 1 },
                removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                removePasswords: { minArgs: 1, maxArgs: 1 },
                removePluginData: { minArgs: 1, maxArgs: 1 },
                settings: { minArgs: 0, maxArgs: 0 },
              },
              commands: { getAll: { minArgs: 0, maxArgs: 0 } },
              contextMenus: {
                remove: { minArgs: 1, maxArgs: 1 },
                removeAll: { minArgs: 0, maxArgs: 0 },
                update: { minArgs: 2, maxArgs: 2 },
              },
              cookies: {
                get: { minArgs: 1, maxArgs: 1 },
                getAll: { minArgs: 1, maxArgs: 1 },
                getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                remove: { minArgs: 1, maxArgs: 1 },
                set: { minArgs: 1, maxArgs: 1 },
              },
              devtools: {
                inspectedWindow: { eval: { minArgs: 1, maxArgs: 2, singleCallbackArg: !1 } },
                panels: {
                  create: { minArgs: 3, maxArgs: 3, singleCallbackArg: !0 },
                  elements: { createSidebarPane: { minArgs: 1, maxArgs: 1 } },
                },
              },
              downloads: {
                cancel: { minArgs: 1, maxArgs: 1 },
                download: { minArgs: 1, maxArgs: 1 },
                erase: { minArgs: 1, maxArgs: 1 },
                getFileIcon: { minArgs: 1, maxArgs: 2 },
                open: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                pause: { minArgs: 1, maxArgs: 1 },
                removeFile: { minArgs: 1, maxArgs: 1 },
                resume: { minArgs: 1, maxArgs: 1 },
                search: { minArgs: 1, maxArgs: 1 },
                show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
              },
              extension: {
                isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
              },
              history: {
                addUrl: { minArgs: 1, maxArgs: 1 },
                deleteAll: { minArgs: 0, maxArgs: 0 },
                deleteRange: { minArgs: 1, maxArgs: 1 },
                deleteUrl: { minArgs: 1, maxArgs: 1 },
                getVisits: { minArgs: 1, maxArgs: 1 },
                search: { minArgs: 1, maxArgs: 1 },
              },
              i18n: { detectLanguage: { minArgs: 1, maxArgs: 1 }, getAcceptLanguages: { minArgs: 0, maxArgs: 0 } },
              identity: { launchWebAuthFlow: { minArgs: 1, maxArgs: 1 } },
              idle: { queryState: { minArgs: 1, maxArgs: 1 } },
              management: {
                get: { minArgs: 1, maxArgs: 1 },
                getAll: { minArgs: 0, maxArgs: 0 },
                getSelf: { minArgs: 0, maxArgs: 0 },
                setEnabled: { minArgs: 2, maxArgs: 2 },
                uninstallSelf: { minArgs: 0, maxArgs: 1 },
              },
              notifications: {
                clear: { minArgs: 1, maxArgs: 1 },
                create: { minArgs: 1, maxArgs: 2 },
                getAll: { minArgs: 0, maxArgs: 0 },
                getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                update: { minArgs: 2, maxArgs: 2 },
              },
              pageAction: {
                getPopup: { minArgs: 1, maxArgs: 1 },
                getTitle: { minArgs: 1, maxArgs: 1 },
                hide: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setIcon: { minArgs: 1, maxArgs: 1 },
                setPopup: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setTitle: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
              },
              permissions: {
                contains: { minArgs: 1, maxArgs: 1 },
                getAll: { minArgs: 0, maxArgs: 0 },
                remove: { minArgs: 1, maxArgs: 1 },
                request: { minArgs: 1, maxArgs: 1 },
              },
              runtime: {
                getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                openOptionsPage: { minArgs: 0, maxArgs: 0 },
                requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                sendMessage: { minArgs: 1, maxArgs: 3 },
                sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                setUninstallURL: { minArgs: 1, maxArgs: 1 },
              },
              sessions: {
                getDevices: { minArgs: 0, maxArgs: 1 },
                getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                restore: { minArgs: 0, maxArgs: 1 },
              },
              storage: {
                local: {
                  clear: { minArgs: 0, maxArgs: 0 },
                  get: { minArgs: 0, maxArgs: 1 },
                  getBytesInUse: { minArgs: 0, maxArgs: 1 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  set: { minArgs: 1, maxArgs: 1 },
                },
                managed: { get: { minArgs: 0, maxArgs: 1 }, getBytesInUse: { minArgs: 0, maxArgs: 1 } },
                sync: {
                  clear: { minArgs: 0, maxArgs: 0 },
                  get: { minArgs: 0, maxArgs: 1 },
                  getBytesInUse: { minArgs: 0, maxArgs: 1 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  set: { minArgs: 1, maxArgs: 1 },
                },
              },
              tabs: {
                captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                create: { minArgs: 1, maxArgs: 1 },
                detectLanguage: { minArgs: 0, maxArgs: 1 },
                discard: { minArgs: 0, maxArgs: 1 },
                duplicate: { minArgs: 1, maxArgs: 1 },
                executeScript: { minArgs: 1, maxArgs: 2 },
                get: { minArgs: 1, maxArgs: 1 },
                getCurrent: { minArgs: 0, maxArgs: 0 },
                getZoom: { minArgs: 0, maxArgs: 1 },
                getZoomSettings: { minArgs: 0, maxArgs: 1 },
                goBack: { minArgs: 0, maxArgs: 1 },
                goForward: { minArgs: 0, maxArgs: 1 },
                highlight: { minArgs: 1, maxArgs: 1 },
                insertCSS: { minArgs: 1, maxArgs: 2 },
                move: { minArgs: 2, maxArgs: 2 },
                query: { minArgs: 1, maxArgs: 1 },
                reload: { minArgs: 0, maxArgs: 2 },
                remove: { minArgs: 1, maxArgs: 1 },
                removeCSS: { minArgs: 1, maxArgs: 2 },
                sendMessage: { minArgs: 2, maxArgs: 3 },
                setZoom: { minArgs: 1, maxArgs: 2 },
                setZoomSettings: { minArgs: 1, maxArgs: 2 },
                update: { minArgs: 1, maxArgs: 2 },
              },
              topSites: { get: { minArgs: 0, maxArgs: 0 } },
              webNavigation: { getAllFrames: { minArgs: 1, maxArgs: 1 }, getFrame: { minArgs: 1, maxArgs: 1 } },
              webRequest: { handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 } },
              windows: {
                create: { minArgs: 0, maxArgs: 1 },
                get: { minArgs: 1, maxArgs: 2 },
                getAll: { minArgs: 0, maxArgs: 1 },
                getCurrent: { minArgs: 0, maxArgs: 1 },
                getLastFocused: { minArgs: 0, maxArgs: 1 },
                remove: { minArgs: 1, maxArgs: 1 },
                update: { minArgs: 2, maxArgs: 2 },
              },
            };
            if (Object.keys(v).length === 0)
              throw new Error('api-metadata.json has not been included in browser-polyfill');
            class x extends WeakMap {
              constructor(r, g = void 0) {
                super(g), (this.createItem = r);
              }
              get(r) {
                return this.has(r) || this.set(r, this.createItem(r)), super.get(r);
              }
            }
            const o = e => e && typeof e == 'object' && typeof e.then == 'function',
              l =
                (e, r) =>
                (...g) => {
                  u.runtime.lastError
                    ? e.reject(new Error(u.runtime.lastError.message))
                    : r.singleCallbackArg || (g.length <= 1 && r.singleCallbackArg !== !1)
                      ? e.resolve(g[0])
                      : e.resolve(g);
                },
              T = e => (e == 1 ? 'argument' : 'arguments'),
              C = (e, r) =>
                function (i, ...A) {
                  if (A.length < r.minArgs)
                    throw new Error(`Expected at least ${r.minArgs} ${T(r.minArgs)} for ${e}(), got ${A.length}`);
                  if (A.length > r.maxArgs)
                    throw new Error(`Expected at most ${r.maxArgs} ${T(r.maxArgs)} for ${e}(), got ${A.length}`);
                  return new Promise((d, h) => {
                    if (r.fallbackToNoCallback)
                      try {
                        i[e](...A, l({ resolve: d, reject: h }, r));
                      } catch (t) {
                        console.warn(
                          `${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                          t,
                        ),
                          i[e](...A),
                          (r.fallbackToNoCallback = !1),
                          (r.noCallback = !0),
                          d();
                      }
                    else r.noCallback ? (i[e](...A), d()) : i[e](...A, l({ resolve: d, reject: h }, r));
                  });
                },
              w = (e, r, g) =>
                new Proxy(r, {
                  apply(i, A, d) {
                    return g.call(A, e, ...d);
                  },
                });
            let k = Function.call.bind(Object.prototype.hasOwnProperty);
            const P = (e, r = {}, g = {}) => {
                let i = Object.create(null),
                  A = {
                    has(h, t) {
                      return t in e || t in i;
                    },
                    get(h, t, b) {
                      if (t in i) return i[t];
                      if (!(t in e)) return;
                      let m = e[t];
                      if (typeof m == 'function')
                        if (typeof r[t] == 'function') m = w(e, e[t], r[t]);
                        else if (k(g, t)) {
                          let S = C(t, g[t]);
                          m = w(e, e[t], S);
                        } else m = m.bind(e);
                      else if (typeof m == 'object' && m !== null && (k(r, t) || k(g, t))) m = P(m, r[t], g[t]);
                      else if (k(g, '*')) m = P(m, r[t], g['*']);
                      else
                        return (
                          Object.defineProperty(i, t, {
                            configurable: !0,
                            enumerable: !0,
                            get() {
                              return e[t];
                            },
                            set(S) {
                              e[t] = S;
                            },
                          }),
                          m
                        );
                      return (i[t] = m), m;
                    },
                    set(h, t, b, m) {
                      return t in i ? (i[t] = b) : (e[t] = b), !0;
                    },
                    defineProperty(h, t, b) {
                      return Reflect.defineProperty(i, t, b);
                    },
                    deleteProperty(h, t) {
                      return Reflect.deleteProperty(i, t);
                    },
                  },
                  d = Object.create(e);
                return new Proxy(d, A);
              },
              _ = e => ({
                addListener(r, g, ...i) {
                  r.addListener(e.get(g), ...i);
                },
                hasListener(r, g) {
                  return r.hasListener(e.get(g));
                },
                removeListener(r, g) {
                  r.removeListener(e.get(g));
                },
              }),
              O = new x(e =>
                typeof e != 'function'
                  ? e
                  : function (g) {
                      const i = P(g, {}, { getContent: { minArgs: 0, maxArgs: 0 } });
                      e(i);
                    },
              ),
              E = new x(e =>
                typeof e != 'function'
                  ? e
                  : function (g, i, A) {
                      let d = !1,
                        h,
                        t = new Promise(N => {
                          h = function (y) {
                            (d = !0), N(y);
                          };
                        }),
                        b;
                      try {
                        b = e(g, i, h);
                      } catch (N) {
                        b = Promise.reject(N);
                      }
                      const m = b !== !0 && o(b);
                      if (b !== !0 && !m && !d) return !1;
                      const S = N => {
                        N.then(
                          y => {
                            A(y);
                          },
                          y => {
                            let B;
                            y && (y instanceof Error || typeof y.message == 'string')
                              ? (B = y.message)
                              : (B = 'An unexpected error occurred'),
                              A({ __mozWebExtensionPolyfillReject__: !0, message: B });
                          },
                        ).catch(y => {
                          console.error('Failed to send onMessage rejected reply', y);
                        });
                      };
                      return S(m ? b : t), !0;
                    },
              ),
              $ = ({ reject: e, resolve: r }, g) => {
                u.runtime.lastError
                  ? u.runtime.lastError.message === f
                    ? r()
                    : e(new Error(u.runtime.lastError.message))
                  : g && g.__mozWebExtensionPolyfillReject__
                    ? e(new Error(g.message))
                    : r(g);
              },
              F = (e, r, g, ...i) => {
                if (i.length < r.minArgs)
                  throw new Error(`Expected at least ${r.minArgs} ${T(r.minArgs)} for ${e}(), got ${i.length}`);
                if (i.length > r.maxArgs)
                  throw new Error(`Expected at most ${r.maxArgs} ${T(r.maxArgs)} for ${e}(), got ${i.length}`);
                return new Promise((A, d) => {
                  const h = $.bind(null, { resolve: A, reject: d });
                  i.push(h), g.sendMessage(...i);
                });
              },
              j = {
                devtools: { network: { onRequestFinished: _(O) } },
                runtime: {
                  onMessage: _(E),
                  onMessageExternal: _(E),
                  sendMessage: F.bind(null, 'sendMessage', { minArgs: 1, maxArgs: 3 }),
                },
                tabs: { sendMessage: F.bind(null, 'sendMessage', { minArgs: 2, maxArgs: 3 }) },
              },
              M = {
                clear: { minArgs: 1, maxArgs: 1 },
                get: { minArgs: 1, maxArgs: 1 },
                set: { minArgs: 1, maxArgs: 1 },
              };
            return (v.privacy = { network: { '*': M }, services: { '*': M }, websites: { '*': M } }), P(u, j, v);
          };
        n.exports = c(chrome);
      }
    });
  })(G);
  var L = (s => ((s.Local = 'local'), (s.Sync = 'sync'), (s.Managed = 'managed'), (s.Session = 'session'), s))(L || {}),
    D = (s => (
      (s.ExtensionPagesOnly = 'TRUSTED_CONTEXTS'),
      (s.ExtensionPagesAndContentScripts = 'TRUSTED_AND_UNTRUSTED_CONTEXTS'),
      s
    ))(D || {}),
    R = (s, a, n) =>
      new Promise((f, c) => {
        var u = o => {
            try {
              x(n.next(o));
            } catch (l) {
              c(l);
            }
          },
          v = o => {
            try {
              x(n.throw(o));
            } catch (l) {
              c(l);
            }
          },
          x = o => (o.done ? f(o.value) : Promise.resolve(o.value).then(u, v));
        x((n = n.apply(s, a)).next());
      });
  const p = globalThis.chrome;
  function U(s, a) {
    return R(this, null, function* () {
      function n(c) {
        return typeof c == 'function';
      }
      function f(c) {
        return c instanceof Promise;
      }
      return n(s) ? (f(s), s(a)) : s;
    });
  }
  let W = !1;
  function q(s) {
    if (p && p.storage[s] === void 0)
      throw new Error(`Check your storage permission in manifest.json: ${s} is not defined`);
  }
  function H(s, a, n) {
    var f, c, u, v, x, o;
    let l = null,
      T = !1,
      C = [];
    const w = (f = n == null ? void 0 : n.storageEnum) != null ? f : L.Local,
      k = (c = n == null ? void 0 : n.liveUpdate) != null ? c : !1,
      P = (v = (u = n == null ? void 0 : n.serialization) == null ? void 0 : u.serialize) != null ? v : e => e,
      _ = (o = (x = n == null ? void 0 : n.serialization) == null ? void 0 : x.deserialize) != null ? o : e => e;
    W === !1 &&
      w === L.Session &&
      (n == null ? void 0 : n.sessionAccessForContentScripts) === !0 &&
      (q(w),
      p == null ||
        p.storage[w].setAccessLevel({ accessLevel: D.ExtensionPagesAndContentScripts }).catch(e => {
          console.warn(e), console.warn('Please call setAccessLevel into different context, like a background script.');
        }),
      (W = !0));
    const O = () =>
        R(this, null, function* () {
          var e;
          q(w);
          const r = yield p == null ? void 0 : p.storage[w].get([s]);
          return r && (e = _(r[s])) != null ? e : a;
        }),
      E = () => {
        C.forEach(e => e());
      },
      $ = e =>
        R(this, null, function* () {
          T === !1 && (l = yield O()),
            (l = yield U(e, l)),
            yield p == null ? void 0 : p.storage[w].set({ [s]: P(l) }),
            E();
        }),
      F = e => (
        (C = [...C, e]),
        () => {
          C = C.filter(r => r !== e);
        }
      ),
      j = () => l;
    O().then(e => {
      (l = e), (T = !0), E();
    });
    function M(e) {
      return R(this, null, function* () {
        if (e[s] === void 0) return;
        const r = _(e[s].newValue);
        l !== r && ((l = yield U(r, l)), E());
      });
    }
    return k && (p == null || p.storage[w].onChanged.addListener(M)), { get: O, set: $, getSnapshot: j, subscribe: F };
  }
  var X = Object.defineProperty,
    K = Object.defineProperties,
    J = Object.getOwnPropertyDescriptors,
    z = Object.getOwnPropertySymbols,
    Q = Object.prototype.hasOwnProperty,
    Y = Object.prototype.propertyIsEnumerable,
    I = (s, a, n) => (a in s ? X(s, a, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (s[a] = n)),
    ee = (s, a) => {
      for (var n in a || (a = {})) Q.call(a, n) && I(s, n, a[n]);
      if (z) for (var n of z(a)) Y.call(a, n) && I(s, n, a[n]);
      return s;
    },
    re = (s, a) => K(s, J(a)),
    se = (s, a, n) =>
      new Promise((f, c) => {
        var u = o => {
            try {
              x(n.next(o));
            } catch (l) {
              c(l);
            }
          },
          v = o => {
            try {
              x(n.throw(o));
            } catch (l) {
              c(l);
            }
          },
          x = o => (o.done ? f(o.value) : Promise.resolve(o.value).then(u, v));
        x((n = n.apply(s, a)).next());
      });
  const V = H('theme-storage-key', 'light', { storageEnum: L.Local, liveUpdate: !0 });
  re(ee({}, V), {
    toggle: () =>
      se(void 0, null, function* () {
        yield V.set(s => (s === 'light' ? 'dark' : 'light'));
      }),
  })
    .get()
    .then(s => {
      console.log('theme', s);
    }),
    console.log('background loaded'),
    console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
})();
