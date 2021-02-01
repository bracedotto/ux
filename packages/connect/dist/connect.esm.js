import { AppConfig, UserSession } from 'blockstack';
import { SECP256K1Client, TokenSigner } from 'jsontokens';
import { serializeCV } from '@blockstack/stacks-transactions';
import { defineCustomElements } from '@stacks/connect-ui';
export * from '@stacks/auth';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

// Width 2px wider than in-page dialog.
// Ensures retina subpixel rounding
// does not leave slightly blurry underlap
var defaultWidth = 442;
var defaultHeight = 532;
var defaultTitle = 'Continue with Secret Key'; // https://developer.mozilla.org/en-US/docs/Web/API/Window/open

var popupCenter = function popupCenter(_ref) {
  var url = _ref.url,
      _ref$title = _ref.title,
      title = _ref$title === void 0 ? defaultTitle : _ref$title,
      _ref$w = _ref.w,
      w = _ref$w === void 0 ? defaultWidth : _ref$w,
      _ref$h = _ref.h,
      h = _ref$h === void 0 ? defaultHeight : _ref$h,
      skipPopupFallback = _ref.skipPopupFallback;
  var win = window; // Safari reports an incorrect browser height

  var isSafari = win.safari !== undefined;
  var browserViewport = {
    width: win.innerWidth,
    height: win.innerHeight
  };
  var browserToolbarHeight = win.outerHeight - win.innerHeight;
  var browserSidepanelWidth = win.outerWidth - win.innerWidth; // Such as fixed operating system UI

  var removeUnusableSpaceX = function removeUnusableSpaceX(coord) {
    return coord - (win.screen.width - win.screen.availWidth);
  };

  var removeUnusableSpaceY = function removeUnusableSpaceY(coord) {
    return coord - (win.screen.height - win.screen.availHeight);
  };

  var browserPosition = {
    x: removeUnusableSpaceX(win.screenX),
    y: removeUnusableSpaceY(win.screenY)
  };
  var left = browserPosition.x + browserSidepanelWidth + (browserViewport.width - w) / 2;
  var top = browserPosition.y + browserToolbarHeight + (browserViewport.height - h) / 2 + (isSafari ? 48 : 0);
  var options = {
    scrollbars: 'no',
    width: w,
    height: h,
    top: top,
    left: left
  };
  var optionsString = Object.keys(options).map(function (key) {
    return key + "=" + options[key];
  });
  var newWindow = window.open(url, title, optionsString.join(','));

  if (newWindow) {
    newWindow.focus();
    return newWindow;
  } // no popup options, just open the auth page


  if (skipPopupFallback) {
    return newWindow;
  }

  return window.open(url);
};
var setupListener = function setupListener(_ref2) {
  var popup = _ref2.popup,
      messageParams = _ref2.messageParams,
      onFinish = _ref2.onFinish,
      onCancel = _ref2.onCancel,
      authURL = _ref2.authURL;
  var lastPong = null; // Send a message to the authenticator popup at a consistent interval. This allows
  // the authenticator to 'respond'.

  var pingInterval = 250;
  var interval = setInterval(function () {
    if (popup) {
      try {
        popup.postMessage(_extends({
          method: 'ping'
        }, messageParams), authURL.origin);
      } catch (error) {
        console.warn('[Blockstack] Unable to send ping to authentication service');
        clearInterval(interval);
      }
    } else {
      console.warn('[Blockstack] Unable to send ping to authentication service - popup closed');
    } // If we haven't received a "pong" recently, then the popup was probably closed
    // by the user. 750ms has been tested by most browsers. Most respond in less than
    // 500ms, although Safari can often take around 600-650ms.


    if (lastPong && new Date().getTime() - lastPong > pingInterval * 8) {
      onCancel && onCancel();
      clearInterval(interval);
    }
  }, pingInterval);

  var receiveMessage = function receiveMessage(event) {
    try {
      if (event.data.method === 'pong') {
        lastPong = new Date().getTime();
        return Promise.resolve();
      }

      var _temp2 = function () {
        if (event.data.source === 'blockstack-app') {
          var data = event.data;
          return Promise.resolve(onFinish(data)).then(function () {
            window.focus();
            window.removeEventListener('message', receiveMessageCallback);
            clearInterval(interval);
          });
        }
      }();

      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var receiveMessageCallback = function receiveMessageCallback(event) {
    void receiveMessage(event);
  };

  window.addEventListener('message', receiveMessageCallback, false);
};

var version = "4.3.15";

var defaultAuthURL = 'https://app.blockstack.org';

if (typeof window !== 'undefined') {
  window.__CONNECT_VERSION__ = version;
}

var isMobile = function isMobile() {
  var ua = navigator.userAgent;

  if (/android/i.test(ua)) {
    return true;
  }

  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }

  if (/Mac OS X/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua)) {
    return true;
  }

  if (/windows phone/i.test(ua)) {
    return true;
  }

  return false;
};
/**
 * mobile should not use a 'popup' type of window.
 */

var shouldUsePopup = function shouldUsePopup() {
  return !isMobile();
};
var getOrCreateUserSession = function getOrCreateUserSession(userSession) {
  if (!userSession) {
    var appConfig = new AppConfig(['store_write'], document.location.href);
    userSession = new UserSession({
      appConfig: appConfig
    });
  }

  return userSession;
};
var authenticate = function authenticate(_ref) {
  var _ref$redirectTo = _ref.redirectTo,
      redirectTo = _ref$redirectTo === void 0 ? '/' : _ref$redirectTo,
      manifestPath = _ref.manifestPath,
      finished = _ref.finished,
      onFinish = _ref.onFinish,
      onCancel = _ref.onCancel,
      authOrigin = _ref.authOrigin,
      _ref$sendToSignIn = _ref.sendToSignIn,
      sendToSignIn = _ref$sendToSignIn === void 0 ? false : _ref$sendToSignIn,
      _userSession = _ref.userSession,
      appDetails = _ref.appDetails;

  try {
    var _window$BlockstackPro;

    var userSession = getOrCreateUserSession(_userSession);

    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }

    var transitKey = userSession.generateAndStoreTransitKey();
    var authRequest = userSession.makeAuthRequest(transitKey, "" + document.location.origin + redirectTo, "" + document.location.origin + manifestPath, userSession.appConfig.scopes, undefined, undefined, {
      sendToSignIn: sendToSignIn,
      appDetails: appDetails,
      connectVersion: version
    });
    var params = window.location.search.substr(1).split('&').filter(function (param) {
      return param.startsWith('utm');
    }).map(function (param) {
      return param.split('=');
    });
    var urlParams = new URLSearchParams();
    params.forEach(function (_ref2) {
      var key = _ref2[0],
          value = _ref2[1];
      return urlParams.set(key, value);
    });
    urlParams.set('authRequest', authRequest);
    var path = sendToSignIn ? 'sign-in' : 'sign-up';
    return Promise.resolve((_window$BlockstackPro = window.BlockstackProvider) === null || _window$BlockstackPro === void 0 ? void 0 : _window$BlockstackPro.getURL()).then(function (extensionURL) {
      var authURL = new URL(extensionURL || authOrigin || defaultAuthURL);
      var url = authURL.origin + "/index.html#/" + path + "?" + urlParams.toString();

      if (shouldUsePopup()) {
        var popup = popupCenter({
          url: url,
          // If the extension is installed, dont worry about popup blocking
          // Otherwise, firefox will open the popup and a new tab.
          skipPopupFallback: !!window.BlockstackProvider
        });
        setupAuthListener({
          popup: popup,
          authRequest: authRequest,
          onFinish: onFinish || finished,
          authURL: authURL,
          userSession: userSession,
          onCancel: onCancel
        });
        return;
      }

      document.location.href = url;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var setupAuthListener = function setupAuthListener(_ref3) {
  var popup = _ref3.popup,
      authRequest = _ref3.authRequest,
      _onFinish = _ref3.onFinish,
      onCancel = _ref3.onCancel,
      authURL = _ref3.authURL,
      userSession = _ref3.userSession;
  setupListener({
    popup: popup,
    onCancel: onCancel,
    onFinish: function (data) {
      try {
        var _temp3 = function () {
          if (data.authRequest === authRequest) {
            var _temp4 = function () {
              if (_onFinish) {
                var authResponse = data.authResponse;
                return Promise.resolve(userSession.handlePendingSignIn(authResponse)).then(function () {
                  _onFinish({
                    authResponse: authResponse,
                    userSession: userSession
                  });
                });
              }
            }();

            if (_temp4 && _temp4.then) return _temp4.then(function () {});
          }
        }();

        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    messageParams: {
      authRequest: authRequest
    },
    authURL: authURL
  });
};

var getUserData = function getUserData(userSession) {
  try {
    userSession = getOrCreateUserSession(userSession);

    if (userSession.isUserSignedIn()) {
      return Promise.resolve(userSession.loadUserData());
    }

    if (userSession.isSignInPending()) {
      return Promise.resolve(userSession.handlePendingSignIn());
    }

    return Promise.resolve(null);
  } catch (e) {
    return Promise.reject(e);
  }
};

var TransactionTypes;

(function (TransactionTypes) {
  TransactionTypes["ContractCall"] = "contract_call";
  TransactionTypes["ContractDeploy"] = "smart_contract";
  TransactionTypes["STXTransfer"] = "token_transfer";
})(TransactionTypes || (TransactionTypes = {}));
/**
 * Contract Call
 */


var ContractCallArgumentType;

(function (ContractCallArgumentType) {
  ContractCallArgumentType["BUFFER"] = "buffer";
  ContractCallArgumentType["UINT"] = "uint";
  ContractCallArgumentType["INT"] = "int";
  ContractCallArgumentType["PRINCIPAL"] = "principal";
  ContractCallArgumentType["BOOL"] = "bool";
})(ContractCallArgumentType || (ContractCallArgumentType = {}));

var generateTokenAndOpenPopup = function generateTokenAndOpenPopup(opts, makeTokenFn) {
  try {
    return Promise.resolve(makeTokenFn(opts)).then(function (token) {
      return openTransactionPopup({
        token: token,
        opts: opts
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var getKeys = function getKeys(_userSession) {
  var userSession = _userSession;

  if (!userSession) {
    var appConfig = new AppConfig(['store_write'], document.location.href);
    userSession = new UserSession({
      appConfig: appConfig
    });
  }

  var privateKey = userSession.loadUserData().appPrivateKey;
  var publicKey = SECP256K1Client.derivePublicKey(privateKey);
  return {
    privateKey: privateKey,
    publicKey: publicKey
  };
};

var signPayload = function signPayload(payload, privateKey) {
  try {
    var tokenSigner = new TokenSigner('ES256k', privateKey);
    return Promise.resolve(tokenSigner.signAsync(payload));
  } catch (e) {
    return Promise.reject(e);
  }
};

var openTransactionPopup = function openTransactionPopup(_ref) {
  var token = _ref.token,
      opts = _ref.opts;

  try {
    var _window$BlockstackPro;

    return Promise.resolve((_window$BlockstackPro = window.BlockstackProvider) === null || _window$BlockstackPro === void 0 ? void 0 : _window$BlockstackPro.getURL()).then(function (extensionURL) {
      var authURL = new URL(extensionURL || opts.authOrigin || defaultAuthURL);
      var urlParams = new URLSearchParams();
      urlParams.set('request', token);
      var popup = popupCenter({
        url: authURL.origin + "/index.html#/transaction?" + urlParams.toString(),
        h: 700
      });
      setupListener({
        popup: popup,
        authURL: authURL,
        onFinish: function onFinish(data) {
          if (opts.finished) {
            opts.finished(data);
          }
        },
        messageParams: {}
      });
      return popup;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var makeContractCallToken = function makeContractCallToken(opts) {
  try {
    var functionArgs = opts.functionArgs,
        appDetails = opts.appDetails,
        userSession = opts.userSession,
        options = _objectWithoutPropertiesLoose(opts, ["functionArgs", "appDetails", "userSession"]);

    var _getKeys = getKeys(userSession),
        privateKey = _getKeys.privateKey,
        publicKey = _getKeys.publicKey;

    var args = functionArgs.map(function (arg) {
      if (typeof arg === 'string') {
        return arg;
      }

      return serializeCV(arg).toString('hex');
    });

    var payload = _extends({}, options, {
      functionArgs: args,
      txType: TransactionTypes.ContractCall,
      publicKey: publicKey
    });

    if (appDetails) {
      payload.appDetails = appDetails;
    }

    return signPayload(payload, privateKey);
  } catch (e) {
    return Promise.reject(e);
  }
};
var makeContractDeployToken = function makeContractDeployToken(opts) {
  try {
    var appDetails = opts.appDetails,
        userSession = opts.userSession,
        options = _objectWithoutPropertiesLoose(opts, ["appDetails", "userSession"]);

    var _getKeys2 = getKeys(userSession),
        privateKey = _getKeys2.privateKey,
        publicKey = _getKeys2.publicKey;

    var payload = _extends({}, options, {
      publicKey: publicKey,
      txType: TransactionTypes.ContractDeploy
    });

    if (appDetails) {
      payload.appDetails = appDetails;
    }

    return signPayload(payload, privateKey);
  } catch (e) {
    return Promise.reject(e);
  }
};
var makeSTXTransferToken = function makeSTXTransferToken(opts) {
  try {
    var amount = opts.amount,
        appDetails = opts.appDetails,
        userSession = opts.userSession,
        options = _objectWithoutPropertiesLoose(opts, ["amount", "appDetails", "userSession"]);

    var _getKeys3 = getKeys(userSession),
        privateKey = _getKeys3.privateKey,
        publicKey = _getKeys3.publicKey;

    var payload = _extends({}, options, {
      amount: amount.toString(10),
      publicKey: publicKey,
      txType: TransactionTypes.STXTransfer
    });

    if (appDetails) {
      payload.appDetails = appDetails;
    }

    return signPayload(payload, privateKey);
  } catch (e) {
    return Promise.reject(e);
  }
};
var openContractCall = function openContractCall(opts) {
  return generateTokenAndOpenPopup(opts, makeContractCallToken);
};
var openContractDeploy = function openContractDeploy(opts) {
  return generateTokenAndOpenPopup(opts, makeContractDeployToken);
};
var openSTXTransfer = function openSTXTransfer(opts) {
  return generateTokenAndOpenPopup(opts, makeSTXTransferToken);
};

var showConnect = function showConnect(authOptions) {
  defineCustomElements();
  var element = document.createElement('connect-modal');
  element.authOptions = authOptions;
  document.body.appendChild(element);

  var finishedWrapper = function finishedWrapper(finishedData) {
    element.remove();
    var callback = authOptions.onFinish || authOptions.finished;

    if (callback) {
      callback(finishedData);
    }
  };

  element.addEventListener('onSignUp', function () {
    authenticate(_extends({}, authOptions, {
      sendToSignIn: false,
      onFinish: finishedWrapper
    }));
  });
  element.addEventListener('onSignIn', function () {
    authenticate(_extends({}, authOptions, {
      sendToSignIn: true,
      onFinish: finishedWrapper
    }));
  });

  var handleEsc = function handleEsc(ev) {
    if (ev.key === 'Escape') {
      document.removeEventListener('keydown', handleEsc);
      element.remove();
    }
  };

  element.addEventListener('onCloseModal', function () {
    document.removeEventListener('keydown', handleEsc);
    element.remove();
  });
  document.addEventListener('keydown', handleEsc);
};
/**
 * @deprecated Use the renamed `showConnect` method
 */

var showBlockstackConnect = function showBlockstackConnect(authOptions) {
  return showConnect(authOptions);
};

export { ContractCallArgumentType, TransactionTypes, authenticate, defaultAuthURL, getOrCreateUserSession, getUserData, isMobile, makeContractCallToken, makeContractDeployToken, makeSTXTransferToken, openContractCall, openContractDeploy, openSTXTransfer, popupCenter, setupListener, shouldUsePopup, showBlockstackConnect, showConnect };
//# sourceMappingURL=connect.esm.js.map
