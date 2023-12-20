// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    // appAPI: 'http://10.1.117.228:8080/bctcapi/api/',
    // appAPI: 'http://apibcqlkt.evn.com.vn:5054/api/',
    appAPI: 'http://localhost:8080/bctcapi/api/',
    // appAPI: 'https://ktat-dev.evn.com.vn/bctcapi/api/',
    // appAPI: 'https://ktat.evn.com.vn/bctcapi/api/',
    // appAPI: `${window.location.origin}/bctcapi/api/`,
    // loginBase: `${window.location.origin}/loginapi/api`,
    loginBase: `https://ktat-dev.evn.com.vn/loginapi/api`,
    appType: 'WEB',
    appId: 'Ktat',
    appVersion: 'v1.0'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
