export const environment = {
    production: true,
    // appAPI: 'http://10.1.117.228:8080/bctcapi/api/',
    // appAPI: 'http://apibcqlkt.evn.com.vn:5054/api/',
    // appAPI: 'http://localhost:8080/bctcapi/api/',
    // appAPI: 'https://ktat-dev.evn.com.vn/bctcapi/api/',
    // appAPI: 'https://ktat.evn.com.vn/bctcapi/api/',
    appAPI: `${window.location.origin}/bctcapi/api/`,
    loginBase: `${window.location.origin}/loginapi/api`,
    // loginBase: `https://ktat-dev.evn.com.vn/loginapi/api`,
    appType: 'WEB',
    appId: 'Ktat',
    appVersion: 'v1.0'
};
