/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/upload/route";
exports.ids = ["app/api/upload/route"];
exports.modules = {

/***/ "(ssr)/./node_modules/@supabase/realtime-js/dist/main sync recursive":
/*!************************************************************!*\
  !*** ./node_modules/@supabase/realtime-js/dist/main/ sync ***!
  \************************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "(ssr)/./node_modules/@supabase/realtime-js/dist/main sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "(rsc)/./node_modules/pdf-parse/lib/pdf.js sync recursive ^\\.\\/.*\\/build\\/pdf\\.js$":
/*!**************************************************************************!*\
  !*** ./node_modules/pdf-parse/lib/pdf.js/ sync ^\.\/.*\/build\/pdf\.js$ ***!
  \**************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./v1.10.100/build/pdf.js": "(rsc)/./node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js",
	"./v1.10.88/build/pdf.js": "(rsc)/./node_modules/pdf-parse/lib/pdf.js/v1.10.88/build/pdf.js",
	"./v1.9.426/build/pdf.js": "(rsc)/./node_modules/pdf-parse/lib/pdf.js/v1.9.426/build/pdf.js",
	"./v2.0.550/build/pdf.js": "(rsc)/./node_modules/pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "(rsc)/./node_modules/pdf-parse/lib/pdf.js sync recursive ^\\.\\/.*\\/build\\/pdf\\.js$";

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist\\client\\components\\action-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist\\client\\components\\action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist\\client\\components\\request-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist\\client\\components\\request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!*********************************************************************************************!*\
  !*** external "next/dist\\client\\components\\static-generation-async-storage.external.js" ***!
  \*********************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist\\client\\components\\static-generation-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_nadav_OneDrive_AI_cursor_cursor_playground_ResumeBuilder_AI_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/upload/route.ts */ \"(rsc)/./src/app/api/upload/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/upload/route\",\n        pathname: \"/api/upload\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\nadav\\\\OneDrive\\\\מסמכים\\\\AI\\\\cursor\\\\cursor playground\\\\ResumeBuilder AI\\\\src\\\\app\\\\api\\\\upload\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_nadav_OneDrive_AI_cursor_cursor_playground_ResumeBuilder_AI_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/upload/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNuYWRhdiU1Q09uZURyaXZlJTVDJUQ3JTlFJUQ3JUExJUQ3JTlFJUQ3JTlCJUQ3JTk5JUQ3JTlEJTVDQUklNUNjdXJzb3IlNUNjdXJzb3IlMjBwbGF5Z3JvdW5kJTVDUmVzdW1lQnVpbGRlciUyMEFJJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNuYWRhdiU1Q09uZURyaXZlJTVDJUQ3JTlFJUQ3JUExJUQ3JTlFJUQ3JTlCJUQ3JTk5JUQ3JTlEJTVDQUklNUNjdXJzb3IlNUNjdXJzb3IlMjBwbGF5Z3JvdW5kJTVDUmVzdW1lQnVpbGRlciUyMEFJJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ29FO0FBQ2pKO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUdBQXVHO0FBQy9HO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDNko7O0FBRTdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdW1lYnVpbGRlci1haS8/YzVkOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxuYWRhdlxcXFxPbmVEcml2ZVxcXFzXnteh157Xm9eZ151cXFxcQUlcXFxcY3Vyc29yXFxcXGN1cnNvciBwbGF5Z3JvdW5kXFxcXFJlc3VtZUJ1aWxkZXIgQUlcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcdXBsb2FkXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS91cGxvYWQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS91cGxvYWRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3VwbG9hZC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXG5hZGF2XFxcXE9uZURyaXZlXFxcXNee16HXnteb15nXnVxcXFxBSVxcXFxjdXJzb3JcXFxcY3Vyc29yIHBsYXlncm91bmRcXFxcUmVzdW1lQnVpbGRlciBBSVxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFx1cGxvYWRcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvdXBsb2FkL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/upload/route.ts":
/*!*************************************!*\
  !*** ./src/app/api/upload/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/auth-helpers-nextjs */ \"(rsc)/./node_modules/@supabase/auth-helpers-nextjs/dist/index.js\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/headers.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_headers__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mammoth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mammoth */ \"(rsc)/./node_modules/mammoth/lib/index.js\");\nconst runtime = \"nodejs\";\n\n\n\n\n// @ts-ignore\nconst pdfParse = __webpack_require__(/*! pdf-parse */ \"(rsc)/./node_modules/pdf-parse/index.js\");\n// File size limit: 10MB\nconst MAX_FILE_SIZE = 10 * 1024 * 1024;\n// Supported file types (PDF support coming soon)\nconst SUPPORTED_TYPES = [\n    \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",\n    \"application/pdf\"\n];\nfunction extractPersonalInfo(text) {\n    const emailRegex = /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g;\n    const phoneRegex = /(\\+?1?[-.\\s]?)?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})/g;\n    const emails = text.match(emailRegex);\n    const phones = text.match(phoneRegex);\n    // Extract name (usually the first line or near contact info)\n    const lines = text.split(\"\\n\").filter((line)=>line.trim().length > 0);\n    const nameCandidate = lines[0]?.trim();\n    return {\n        name: nameCandidate && nameCandidate.length < 50 ? nameCandidate : undefined,\n        email: emails ? emails[0] : undefined,\n        phone: phones ? phones[0] : undefined\n    };\n}\nfunction extractExperience(text) {\n    const experience = [];\n    // Look for common work experience patterns\n    const workSectionRegex = /(experience|employment|work history|professional experience)/i;\n    const lines = text.split(\"\\n\");\n    let inWorkSection = false;\n    let currentEntry = {\n        company: \"\",\n        position: \"\",\n        description: \"\"\n    };\n    for(let i = 0; i < lines.length; i++){\n        const line = lines[i].trim();\n        if (workSectionRegex.test(line)) {\n            inWorkSection = true;\n            continue;\n        }\n        if (inWorkSection && line.length > 0) {\n            // Simple heuristic: if line contains common job title words\n            if (/\\b(manager|developer|engineer|analyst|specialist|director|coordinator|assistant)\\b/i.test(line)) {\n                if (currentEntry.company || currentEntry.position) {\n                    experience.push({\n                        ...currentEntry\n                    });\n                }\n                currentEntry = {\n                    company: \"\",\n                    position: line,\n                    description: \"\"\n                };\n            } else if (!currentEntry.company && line.length > 0) {\n                currentEntry.company = line;\n            } else if (line.length > 10) {\n                currentEntry.description += (currentEntry.description ? \" \" : \"\") + line;\n            }\n        }\n    }\n    if (currentEntry.company || currentEntry.position) {\n        experience.push(currentEntry);\n    }\n    return experience;\n}\nfunction extractEducation(text) {\n    const education = [];\n    const educationRegex = /(education|academic background|qualifications)/i;\n    const degreeRegex = /\\b(bachelor|master|phd|doctorate|associate|diploma|certificate)\\b/i;\n    const lines = text.split(\"\\n\");\n    let inEducationSection = false;\n    for (const line of lines){\n        const trimmedLine = line.trim();\n        if (educationRegex.test(trimmedLine)) {\n            inEducationSection = true;\n            continue;\n        }\n        if (inEducationSection && degreeRegex.test(trimmedLine)) {\n            education.push({\n                institution: \"\",\n                degree: trimmedLine,\n                graduationDate: undefined\n            });\n        }\n    }\n    return education;\n}\nfunction extractSkills(text) {\n    const skills = [];\n    const skillsRegex = /(skills|technologies|competencies|proficiencies)/i;\n    const lines = text.split(\"\\n\");\n    let inSkillsSection = false;\n    for (const line of lines){\n        const trimmedLine = line.trim();\n        if (skillsRegex.test(trimmedLine)) {\n            inSkillsSection = true;\n            continue;\n        }\n        if (inSkillsSection && trimmedLine.length > 0) {\n            // Split by common delimiters\n            const lineSkills = trimmedLine.split(/[,;|•·]/).map((skill)=>skill.trim()).filter((skill)=>skill.length > 0);\n            skills.push(...lineSkills);\n        }\n    }\n    return skills;\n}\nfunction parseResumeText(text) {\n    const personalInfo = extractPersonalInfo(text);\n    const experience = extractExperience(text);\n    const education = extractEducation(text);\n    const skills = extractSkills(text);\n    // Extract summary (usually first few lines after name)\n    const lines = text.split(\"\\n\").filter((line)=>line.trim().length > 0);\n    const summaryLines = lines.slice(1, 4).join(\" \");\n    const summary = summaryLines.length > 20 ? summaryLines : undefined;\n    return {\n        personalInfo,\n        experience,\n        education,\n        skills,\n        summary,\n        rawText: text\n    };\n}\nasync function POST(request) {\n    try {\n        // Create Supabase client\n        const supabase = (0,_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__.createRouteHandlerClient)({\n            cookies: next_headers__WEBPACK_IMPORTED_MODULE_2__.cookies\n        });\n        // Check authentication\n        const { data: { user }, error: authError } = await supabase.auth.getUser();\n        if (authError || !user) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Authentication required\"\n            }, {\n                status: 401\n            });\n        }\n        // Parse form data\n        const formData = await request.formData();\n        const file = formData.get(\"file\");\n        if (!file) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"No file provided\"\n            }, {\n                status: 400\n            });\n        }\n        // Validate file type\n        if (!SUPPORTED_TYPES.includes(file.type)) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unsupported file type. Please upload a DOCX or PDF file.\"\n            }, {\n                status: 400\n            });\n        }\n        // Validate file size\n        if (file.size > MAX_FILE_SIZE) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"File too large. Maximum size is 10MB.\"\n            }, {\n                status: 400\n            });\n        }\n        // Convert file to buffer\n        const buffer = Buffer.from(await file.arrayBuffer());\n        let text = \"\";\n        if (file.type === \"application/pdf\") {\n            try {\n                const pdfData = await pdfParse(buffer);\n                text = pdfData.text;\n            } catch (err) {\n                return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                    error: \"Failed to parse PDF. Please ensure the file is not corrupted.\"\n                }, {\n                    status: 400\n                });\n            }\n        } else if (file.type === \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\") {\n            const result = await mammoth__WEBPACK_IMPORTED_MODULE_3__.extractRawText({\n                buffer\n            });\n            text = result.value;\n        }\n        if (!text.trim()) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"No text content found in the file.\"\n            }, {\n                status: 400\n            });\n        }\n        // Parse resume text into structured data\n        const parsedData = parseResumeText(text);\n        // Store the parsed resume data in Supabase\n        const { data: resumeData, error: insertError } = await supabase.from(\"resumes\").insert({\n            user_id: user.id,\n            original_filename: file.name,\n            parsed_data: parsedData,\n            raw_text: text,\n            status: \"processed\",\n            created_at: new Date().toISOString(),\n            updated_at: new Date().toISOString()\n        }).select().single();\n        if (insertError) {\n            console.error(\"Error storing resume:\", insertError);\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Failed to store resume data\"\n            }, {\n                status: 500\n            });\n        }\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            success: true,\n            data: {\n                id: resumeData.id,\n                parsed: parsedData\n            }\n        });\n    } catch (error) {\n        console.error(\"Upload error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to process resume\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFBTTtRQUVULElBQUlaLGFBQWE7WUFDZmEsUUFBUXBDLEtBQUssQ0FBQyx5QkFBeUJ1QjtZQUN2QyxPQUFPeEYsa0ZBQVlBLENBQUNxRSxJQUFJLENBQ3RCO2dCQUFFSixPQUFPO1lBQThCLEdBQ3ZDO2dCQUFFSyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxPQUFPdEUsa0ZBQVlBLENBQUNxRSxJQUFJLENBQUM7WUFDdkJpQyxTQUFTO1lBQ1R2QyxNQUFNO2dCQUNKNEIsSUFBSUosV0FBV0ksRUFBRTtnQkFDakJZLFFBQVFqQjtZQUNWO1FBQ0Y7SUFFRixFQUFFLE9BQU9yQixPQUFPO1FBQ2RvQyxRQUFRcEMsS0FBSyxDQUFDLGlCQUFpQkE7UUFDL0IsT0FBT2pFLGtGQUFZQSxDQUFDcUUsSUFBSSxDQUN0QjtZQUFFSixPQUFPO1FBQTJCLEdBQ3BDO1lBQUVLLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdW1lYnVpbGRlci1haS8uL3NyYy9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50cz81MTIyIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBydW50aW1lID0gJ25vZGVqcyc7XG5cbmltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGNyZWF0ZVJvdXRlSGFuZGxlckNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9hdXRoLWhlbHBlcnMtbmV4dGpzJ1xuaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycydcbmltcG9ydCBtYW1tb3RoIGZyb20gJ21hbW1vdGgnXG5pbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJ0AvdHlwZXMvc3VwYWJhc2UnXG4vLyBAdHMtaWdub3JlXG5jb25zdCBwZGZQYXJzZSA9IHJlcXVpcmUoJ3BkZi1wYXJzZScpO1xuXG4vLyBGaWxlIHNpemUgbGltaXQ6IDEwTUJcbmNvbnN0IE1BWF9GSUxFX1NJWkUgPSAxMCAqIDEwMjQgKiAxMDI0XG5cbi8vIFN1cHBvcnRlZCBmaWxlIHR5cGVzIChQREYgc3VwcG9ydCBjb21pbmcgc29vbilcbmNvbnN0IFNVUFBPUlRFRF9UWVBFUyA9IFtcbiAgJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50JyxcbiAgJ2FwcGxpY2F0aW9uL3BkZidcbl1cblxuaW50ZXJmYWNlIFBhcnNlZFJlc3VtZURhdGEge1xuICBwZXJzb25hbEluZm86IHtcbiAgICBuYW1lPzogc3RyaW5nXG4gICAgZW1haWw/OiBzdHJpbmdcbiAgICBwaG9uZT86IHN0cmluZ1xuICAgIGFkZHJlc3M/OiBzdHJpbmdcbiAgfVxuICBleHBlcmllbmNlOiBBcnJheTx7XG4gICAgY29tcGFueTogc3RyaW5nXG4gICAgcG9zaXRpb246IHN0cmluZ1xuICAgIHN0YXJ0RGF0ZT86IHN0cmluZ1xuICAgIGVuZERhdGU/OiBzdHJpbmdcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nXG4gIH0+XG4gIGVkdWNhdGlvbjogQXJyYXk8e1xuICAgIGluc3RpdHV0aW9uOiBzdHJpbmdcbiAgICBkZWdyZWU6IHN0cmluZ1xuICAgIGdyYWR1YXRpb25EYXRlPzogc3RyaW5nXG4gIH0+XG4gIHNraWxsczogc3RyaW5nW11cbiAgc3VtbWFyeT86IHN0cmluZ1xuICByYXdUZXh0OiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFBlcnNvbmFsSW5mbyh0ZXh0OiBzdHJpbmcpIHtcbiAgY29uc3QgZW1haWxSZWdleCA9IC9cXGJbQS1aYS16MC05Ll8lKy1dK0BbQS1aYS16MC05Li1dK1xcLltBLVp8YS16XXsyLH1cXGIvZ1xuICBjb25zdCBwaG9uZVJlZ2V4ID0gLyhcXCs/MT9bLS5cXHNdPyk/XFwoPyhbMC05XXszfSlcXCk/Wy0uXFxzXT8oWzAtOV17M30pWy0uXFxzXT8oWzAtOV17NH0pL2dcbiAgXG4gIGNvbnN0IGVtYWlscyA9IHRleHQubWF0Y2goZW1haWxSZWdleClcbiAgY29uc3QgcGhvbmVzID0gdGV4dC5tYXRjaChwaG9uZVJlZ2V4KVxuICBcbiAgLy8gRXh0cmFjdCBuYW1lICh1c3VhbGx5IHRoZSBmaXJzdCBsaW5lIG9yIG5lYXIgY29udGFjdCBpbmZvKVxuICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpLmxlbmd0aCA+IDApXG4gIGNvbnN0IG5hbWVDYW5kaWRhdGUgPSBsaW5lc1swXT8udHJpbSgpXG4gIFxuICByZXR1cm4ge1xuICAgIG5hbWU6IG5hbWVDYW5kaWRhdGUgJiYgbmFtZUNhbmRpZGF0ZS5sZW5ndGggPCA1MCA/IG5hbWVDYW5kaWRhdGUgOiB1bmRlZmluZWQsXG4gICAgZW1haWw6IGVtYWlscyA/IGVtYWlsc1swXSA6IHVuZGVmaW5lZCxcbiAgICBwaG9uZTogcGhvbmVzID8gcGhvbmVzWzBdIDogdW5kZWZpbmVkLFxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RFeHBlcmllbmNlKHRleHQ6IHN0cmluZykge1xuICBjb25zdCBleHBlcmllbmNlOiBQYXJzZWRSZXN1bWVEYXRhWydleHBlcmllbmNlJ10gPSBbXVxuICBcbiAgLy8gTG9vayBmb3IgY29tbW9uIHdvcmsgZXhwZXJpZW5jZSBwYXR0ZXJuc1xuICBjb25zdCB3b3JrU2VjdGlvblJlZ2V4ID0gLyhleHBlcmllbmNlfGVtcGxveW1lbnR8d29yayBoaXN0b3J5fHByb2Zlc3Npb25hbCBleHBlcmllbmNlKS9pXG4gIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgXG4gIGxldCBpbldvcmtTZWN0aW9uID0gZmFsc2VcbiAgbGV0IGN1cnJlbnRFbnRyeSA9IHsgY29tcGFueTogJycsIHBvc2l0aW9uOiAnJywgZGVzY3JpcHRpb246ICcnIH1cbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsaW5lID0gbGluZXNbaV0udHJpbSgpXG4gICAgXG4gICAgaWYgKHdvcmtTZWN0aW9uUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgaW5Xb3JrU2VjdGlvbiA9IHRydWVcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIFxuICAgIGlmIChpbldvcmtTZWN0aW9uICYmIGxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgLy8gU2ltcGxlIGhldXJpc3RpYzogaWYgbGluZSBjb250YWlucyBjb21tb24gam9iIHRpdGxlIHdvcmRzXG4gICAgICBpZiAoL1xcYihtYW5hZ2VyfGRldmVsb3BlcnxlbmdpbmVlcnxhbmFseXN0fHNwZWNpYWxpc3R8ZGlyZWN0b3J8Y29vcmRpbmF0b3J8YXNzaXN0YW50KVxcYi9pLnRlc3QobGluZSkpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRFbnRyeS5jb21wYW55IHx8IGN1cnJlbnRFbnRyeS5wb3NpdGlvbikge1xuICAgICAgICAgIGV4cGVyaWVuY2UucHVzaCh7IC4uLmN1cnJlbnRFbnRyeSB9KVxuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbnRyeSA9IHsgY29tcGFueTogJycsIHBvc2l0aW9uOiBsaW5lLCBkZXNjcmlwdGlvbjogJycgfVxuICAgICAgfSBlbHNlIGlmICghY3VycmVudEVudHJ5LmNvbXBhbnkgJiYgbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnRFbnRyeS5jb21wYW55ID0gbGluZVxuICAgICAgfSBlbHNlIGlmIChsaW5lLmxlbmd0aCA+IDEwKSB7XG4gICAgICAgIGN1cnJlbnRFbnRyeS5kZXNjcmlwdGlvbiArPSAoY3VycmVudEVudHJ5LmRlc2NyaXB0aW9uID8gJyAnIDogJycpICsgbGluZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgaWYgKGN1cnJlbnRFbnRyeS5jb21wYW55IHx8IGN1cnJlbnRFbnRyeS5wb3NpdGlvbikge1xuICAgIGV4cGVyaWVuY2UucHVzaChjdXJyZW50RW50cnkpXG4gIH1cbiAgXG4gIHJldHVybiBleHBlcmllbmNlXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RFZHVjYXRpb24odGV4dDogc3RyaW5nKSB7XG4gIGNvbnN0IGVkdWNhdGlvbjogUGFyc2VkUmVzdW1lRGF0YVsnZWR1Y2F0aW9uJ10gPSBbXVxuICBcbiAgY29uc3QgZWR1Y2F0aW9uUmVnZXggPSAvKGVkdWNhdGlvbnxhY2FkZW1pYyBiYWNrZ3JvdW5kfHF1YWxpZmljYXRpb25zKS9pXG4gIGNvbnN0IGRlZ3JlZVJlZ2V4ID0gL1xcYihiYWNoZWxvcnxtYXN0ZXJ8cGhkfGRvY3RvcmF0ZXxhc3NvY2lhdGV8ZGlwbG9tYXxjZXJ0aWZpY2F0ZSlcXGIvaVxuICBcbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICBsZXQgaW5FZHVjYXRpb25TZWN0aW9uID0gZmFsc2VcbiAgXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKClcbiAgICBcbiAgICBpZiAoZWR1Y2F0aW9uUmVnZXgudGVzdCh0cmltbWVkTGluZSkpIHtcbiAgICAgIGluRWR1Y2F0aW9uU2VjdGlvbiA9IHRydWVcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIFxuICAgIGlmIChpbkVkdWNhdGlvblNlY3Rpb24gJiYgZGVncmVlUmVnZXgudGVzdCh0cmltbWVkTGluZSkpIHtcbiAgICAgIGVkdWNhdGlvbi5wdXNoKHtcbiAgICAgICAgaW5zdGl0dXRpb246ICcnLFxuICAgICAgICBkZWdyZWU6IHRyaW1tZWRMaW5lLFxuICAgICAgICBncmFkdWF0aW9uRGF0ZTogdW5kZWZpbmVkXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGVkdWNhdGlvblxufVxuXG5mdW5jdGlvbiBleHRyYWN0U2tpbGxzKHRleHQ6IHN0cmluZykge1xuICBjb25zdCBza2lsbHM6IHN0cmluZ1tdID0gW11cbiAgXG4gIGNvbnN0IHNraWxsc1JlZ2V4ID0gLyhza2lsbHN8dGVjaG5vbG9naWVzfGNvbXBldGVuY2llc3xwcm9maWNpZW5jaWVzKS9pXG4gIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgXG4gIGxldCBpblNraWxsc1NlY3Rpb24gPSBmYWxzZVxuICBcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKVxuICAgIFxuICAgIGlmIChza2lsbHNSZWdleC50ZXN0KHRyaW1tZWRMaW5lKSkge1xuICAgICAgaW5Ta2lsbHNTZWN0aW9uID0gdHJ1ZVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgXG4gICAgaWYgKGluU2tpbGxzU2VjdGlvbiAmJiB0cmltbWVkTGluZS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTcGxpdCBieSBjb21tb24gZGVsaW1pdGVyc1xuICAgICAgY29uc3QgbGluZVNraWxscyA9IHRyaW1tZWRMaW5lLnNwbGl0KC9bLDt84oCiwrddLykubWFwKHNraWxsID0+IHNraWxsLnRyaW0oKSkuZmlsdGVyKHNraWxsID0+IHNraWxsLmxlbmd0aCA+IDApXG4gICAgICBza2lsbHMucHVzaCguLi5saW5lU2tpbGxzKVxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIHNraWxsc1xufVxuXG5mdW5jdGlvbiBwYXJzZVJlc3VtZVRleHQodGV4dDogc3RyaW5nKTogUGFyc2VkUmVzdW1lRGF0YSB7XG4gIGNvbnN0IHBlcnNvbmFsSW5mbyA9IGV4dHJhY3RQZXJzb25hbEluZm8odGV4dClcbiAgY29uc3QgZXhwZXJpZW5jZSA9IGV4dHJhY3RFeHBlcmllbmNlKHRleHQpXG4gIGNvbnN0IGVkdWNhdGlvbiA9IGV4dHJhY3RFZHVjYXRpb24odGV4dClcbiAgY29uc3Qgc2tpbGxzID0gZXh0cmFjdFNraWxscyh0ZXh0KVxuICBcbiAgLy8gRXh0cmFjdCBzdW1tYXJ5ICh1c3VhbGx5IGZpcnN0IGZldyBsaW5lcyBhZnRlciBuYW1lKVxuICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpLmxlbmd0aCA+IDApXG4gIGNvbnN0IHN1bW1hcnlMaW5lcyA9IGxpbmVzLnNsaWNlKDEsIDQpLmpvaW4oJyAnKVxuICBjb25zdCBzdW1tYXJ5ID0gc3VtbWFyeUxpbmVzLmxlbmd0aCA+IDIwID8gc3VtbWFyeUxpbmVzIDogdW5kZWZpbmVkXG4gIFxuICByZXR1cm4ge1xuICAgIHBlcnNvbmFsSW5mbyxcbiAgICBleHBlcmllbmNlLFxuICAgIGVkdWNhdGlvbixcbiAgICBza2lsbHMsXG4gICAgc3VtbWFyeSxcbiAgICByYXdUZXh0OiB0ZXh0XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICAvLyBDcmVhdGUgU3VwYWJhc2UgY2xpZW50XG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVSb3V0ZUhhbmRsZXJDbGllbnQ8RGF0YWJhc2U+KHsgY29va2llcyB9KVxuICAgIFxuICAgIC8vIENoZWNrIGF1dGhlbnRpY2F0aW9uXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSwgZXJyb3I6IGF1dGhFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcbiAgICBcbiAgICBpZiAoYXV0aEVycm9yIHx8ICF1c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgZm9ybSBkYXRhXG4gICAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKClcbiAgICBjb25zdCBmaWxlID0gZm9ybURhdGEuZ2V0KCdmaWxlJykgYXMgRmlsZSB8IG51bGxcblxuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnTm8gZmlsZSBwcm92aWRlZCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZmlsZSB0eXBlXG4gICAgaWYgKCFTVVBQT1JURURfVFlQRVMuaW5jbHVkZXMoZmlsZS50eXBlKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnVW5zdXBwb3J0ZWQgZmlsZSB0eXBlLiBQbGVhc2UgdXBsb2FkIGEgRE9DWCBvciBQREYgZmlsZS4nIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGZpbGUgc2l6ZVxuICAgIGlmIChmaWxlLnNpemUgPiBNQVhfRklMRV9TSVpFKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdGaWxlIHRvbyBsYXJnZS4gTWF4aW11bSBzaXplIGlzIDEwTUIuJyB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGZpbGUgdG8gYnVmZmVyXG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKVxuICAgIGxldCB0ZXh0ID0gJydcbiAgICBpZiAoZmlsZS50eXBlID09PSAnYXBwbGljYXRpb24vcGRmJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGRmRGF0YSA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcilcbiAgICAgICAgdGV4dCA9IHBkZkRhdGEudGV4dFxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICB7IGVycm9yOiAnRmFpbGVkIHRvIHBhcnNlIFBERi4gUGxlYXNlIGVuc3VyZSB0aGUgZmlsZSBpcyBub3QgY29ycnVwdGVkLicgfSxcbiAgICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZmlsZS50eXBlID09PSAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtYW1tb3RoLmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyIH0pXG4gICAgICB0ZXh0ID0gcmVzdWx0LnZhbHVlXG4gICAgfVxuICAgIGlmICghdGV4dC50cmltKCkpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogJ05vIHRleHQgY29udGVudCBmb3VuZCBpbiB0aGUgZmlsZS4nIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIFBhcnNlIHJlc3VtZSB0ZXh0IGludG8gc3RydWN0dXJlZCBkYXRhXG4gICAgY29uc3QgcGFyc2VkRGF0YSA9IHBhcnNlUmVzdW1lVGV4dCh0ZXh0KVxuXG4gICAgLy8gU3RvcmUgdGhlIHBhcnNlZCByZXN1bWUgZGF0YSBpbiBTdXBhYmFzZVxuICAgIGNvbnN0IHsgZGF0YTogcmVzdW1lRGF0YSwgZXJyb3I6IGluc2VydEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3Jlc3VtZXMnKVxuICAgICAgLmluc2VydCh7XG4gICAgICAgIHVzZXJfaWQ6IHVzZXIuaWQsXG4gICAgICAgIG9yaWdpbmFsX2ZpbGVuYW1lOiBmaWxlLm5hbWUsXG4gICAgICAgIHBhcnNlZF9kYXRhOiBwYXJzZWREYXRhLFxuICAgICAgICByYXdfdGV4dDogdGV4dCxcbiAgICAgICAgc3RhdHVzOiAncHJvY2Vzc2VkJyxcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pXG4gICAgICAuc2VsZWN0KClcbiAgICAgIC5zaW5nbGUoKVxuXG4gICAgaWYgKGluc2VydEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzdG9yaW5nIHJlc3VtZTonLCBpbnNlcnRFcnJvcilcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogJ0ZhaWxlZCB0byBzdG9yZSByZXN1bWUgZGF0YScgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGlkOiByZXN1bWVEYXRhLmlkLFxuICAgICAgICBwYXJzZWQ6IHBhcnNlZERhdGFcbiAgICAgIH1cbiAgICB9KVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignVXBsb2FkIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gcHJvY2VzcyByZXN1bWUnIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbInJ1bnRpbWUiLCJOZXh0UmVzcG9uc2UiLCJjcmVhdGVSb3V0ZUhhbmRsZXJDbGllbnQiLCJjb29raWVzIiwibWFtbW90aCIsInBkZlBhcnNlIiwicmVxdWlyZSIsIk1BWF9GSUxFX1NJWkUiLCJTVVBQT1JURURfVFlQRVMiLCJleHRyYWN0UGVyc29uYWxJbmZvIiwidGV4dCIsImVtYWlsUmVnZXgiLCJwaG9uZVJlZ2V4IiwiZW1haWxzIiwibWF0Y2giLCJwaG9uZXMiLCJsaW5lcyIsInNwbGl0IiwiZmlsdGVyIiwibGluZSIsInRyaW0iLCJsZW5ndGgiLCJuYW1lQ2FuZGlkYXRlIiwibmFtZSIsInVuZGVmaW5lZCIsImVtYWlsIiwicGhvbmUiLCJleHRyYWN0RXhwZXJpZW5jZSIsImV4cGVyaWVuY2UiLCJ3b3JrU2VjdGlvblJlZ2V4IiwiaW5Xb3JrU2VjdGlvbiIsImN1cnJlbnRFbnRyeSIsImNvbXBhbnkiLCJwb3NpdGlvbiIsImRlc2NyaXB0aW9uIiwiaSIsInRlc3QiLCJwdXNoIiwiZXh0cmFjdEVkdWNhdGlvbiIsImVkdWNhdGlvbiIsImVkdWNhdGlvblJlZ2V4IiwiZGVncmVlUmVnZXgiLCJpbkVkdWNhdGlvblNlY3Rpb24iLCJ0cmltbWVkTGluZSIsImluc3RpdHV0aW9uIiwiZGVncmVlIiwiZ3JhZHVhdGlvbkRhdGUiLCJleHRyYWN0U2tpbGxzIiwic2tpbGxzIiwic2tpbGxzUmVnZXgiLCJpblNraWxsc1NlY3Rpb24iLCJsaW5lU2tpbGxzIiwibWFwIiwic2tpbGwiLCJwYXJzZVJlc3VtZVRleHQiLCJwZXJzb25hbEluZm8iLCJzdW1tYXJ5TGluZXMiLCJzbGljZSIsImpvaW4iLCJzdW1tYXJ5IiwicmF3VGV4dCIsIlBPU1QiLCJyZXF1ZXN0Iiwic3VwYWJhc2UiLCJkYXRhIiwidXNlciIsImVycm9yIiwiYXV0aEVycm9yIiwiYXV0aCIsImdldFVzZXIiLCJqc29uIiwic3RhdHVzIiwiZm9ybURhdGEiLCJmaWxlIiwiZ2V0IiwiaW5jbHVkZXMiLCJ0eXBlIiwic2l6ZSIsImJ1ZmZlciIsIkJ1ZmZlciIsImZyb20iLCJhcnJheUJ1ZmZlciIsInBkZkRhdGEiLCJlcnIiLCJyZXN1bHQiLCJleHRyYWN0UmF3VGV4dCIsInZhbHVlIiwicGFyc2VkRGF0YSIsInJlc3VtZURhdGEiLCJpbnNlcnRFcnJvciIsImluc2VydCIsInVzZXJfaWQiLCJpZCIsIm9yaWdpbmFsX2ZpbGVuYW1lIiwicGFyc2VkX2RhdGEiLCJyYXdfdGV4dCIsImNyZWF0ZWRfYXQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJ1cGRhdGVkX2F0Iiwic2VsZWN0Iiwic2luZ2xlIiwiY29uc29sZSIsInN1Y2Nlc3MiLCJwYXJzZWQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/upload/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/pdf-parse","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/ws","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/underscore","vendor-chunks/mammoth","vendor-chunks/bluebird","vendor-chunks/jszip","vendor-chunks/xmlbuilder","vendor-chunks/pako","vendor-chunks/lop","vendor-chunks/readable-stream","vendor-chunks/@xmldom","vendor-chunks/jose","vendor-chunks/inherits","vendor-chunks/dingbat-to-unicode","vendor-chunks/util-deprecate","vendor-chunks/string_decoder","vendor-chunks/set-cookie-parser","vendor-chunks/safe-buffer","vendor-chunks/process-nextick-args","vendor-chunks/path-is-absolute","vendor-chunks/option","vendor-chunks/lie","vendor-chunks/immediate","vendor-chunks/core-util-is","vendor-chunks/base64-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnadav%5COneDrive%5C%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%D7%9D%5CAI%5Ccursor%5Ccursor%20playground%5CResumeBuilder%20AI&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();