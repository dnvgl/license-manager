//const jwt_decode = require("jwt-decode").default;
const axios = require("axios");
const url = require("url");
const querystring = require("querystring");
const {
  getRefreshToken,
  setRefreshToken,
  deleteRefreshToken,
} = require("./token-store");

const authDomain =
  "login.microsoftonline.com/te/dnvglb2cstag.onmicrosoft.com/b2c_1a_signinwithadfsidp/oauth2/v2.0";
const clientId = "b480340b-31f0-4179-b5fc-b5fcdf0a511e";
const clientSecret = "BFDmgX5bNOyCM3y-URco0.__dabF1Y_9JG";

const redirectUri = "http://localhost/callback";

let accessToken = null;
//let profile = null;
let refreshToken = null;

function getAccessToken() {
  return accessToken;
}

/*
function getProfile() {
  return profile;
}
*/

//https://login.microsoftonline.com/te/dnvglb2cstag.onmicrosoft.com/b2c_1a_signinwithadfsidp/oauth2/v2.0/authorize?client_id=b480340b-31f0-4179-b5fc-b5fcdf0a511e&response_type=code&scope=offline_access https://dnvglb2cstag.onmicrosoft.com/28b7ec7b-db04-40bb-a042-b7ac5a8b36be/user_impersonation&redirect_uri=https://ecosystem-dev.dnvgl.com/session/auth-callback/veracity

function getAuthenticationURL() {
  return (
    "https://" +
    authDomain +
    "/authorize?" +
    "scope=offline_access https://dnvglb2cstag.onmicrosoft.com/28b7ec7b-db04-40bb-a042-b7ac5a8b36be/user_impersonation&" +
    "response_type=code&" +
    "client_id=" +
    clientId +
    "&" +
    "redirect_uri=" +
    redirectUri
  );
}

async function refreshTokens() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    const refreshOptions = {
      method: "POST",
      url: `https://${authDomain}/token`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: querystring.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    };

    try {
      const response = await axios(refreshOptions);

      accessToken = response.data.access_token;
      //profile = jwt_decode(response.data.profile_info);

      console.log(accessToken);
    } catch (error) {
      await logout();
      throw error;
    }
  } else {
    throw new Error("No available refresh token.");
  }
}

async function loadTokens(callbackURL) {
  const urlParts = url.parse(callbackURL, true);
  const query = urlParts.query;

  const exchangeOptions = {
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code: query.code,
    redirect_uri: redirectUri,
  };

  const options = {
    method: "POST",
    url: `https://${authDomain}/token`,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: querystring.stringify(exchangeOptions),
  };

  try {
    const response = await axios(options);

    console.log(response.data);

    accessToken = response.data.access_token;

    //profile = jwt_decode(response.data.id_token);
    refreshToken = response.data.refresh_token;

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    }
  } catch (error) {
    console.error(error);

    await logout();

    throw error;
  }
}

async function logout() {
  await deleteRefreshToken();
  accessToken = null;
  //profile = null;
  refreshToken = null;
}

function getLogOutUrl() {
  return `https://${authDomain}/logout`;
}

module.exports = {
  getAccessToken,
  getAuthenticationURL,
  getLogOutUrl,
  //getProfile,
  loadTokens,
  logout,
  refreshTokens,
};
