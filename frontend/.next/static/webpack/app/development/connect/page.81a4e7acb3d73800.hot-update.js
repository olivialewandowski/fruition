"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/development/connect/page",{

/***/ "(app-pages-browser)/./src/components/connect/ConnectNavigation.tsx":
/*!******************************************************!*\
  !*** ./src/components/connect/ConnectNavigation.tsx ***!
  \******************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/navigation */ \"(app-pages-browser)/./node_modules/next/dist/api/navigation.js\");\n/* harmony import */ var _config_firebase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/config/firebase */ \"(app-pages-browser)/./src/config/firebase.ts\");\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/contexts/AuthContext */ \"(app-pages-browser)/./src/contexts/AuthContext.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\nconst ConnectNavigation = (param)=>{\n    let { activeTab, onTabChange, savedCount = 0, appliedCount = 0 } = param;\n    _s();\n    const router = (0,next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [isProfileMenuOpen, setIsProfileMenuOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const { user, userData, signOut } = (0,_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__.useAuth)();\n    const handleSignOut = async ()=>{\n        try {\n            await _config_firebase__WEBPACK_IMPORTED_MODULE_3__.auth.signOut();\n            router.push('/development/login');\n        } catch (error) {\n            console.error('Error signing out:', error);\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex overflow-visible relative flex-wrap gap-5 justify-center px-6 py-3.5 w-full bg-white border border-solid border-neutral-200 shadow-md rounded-2xl max-w-[100%] mx-auto mb-4\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"flex gap-10 items-center text-lg text-center text-violet-900 whitespace-nowrap max-md:max-w-full\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'discover' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'),\n                    onClick: ()=>onTabChange('discover'),\n                    children: \"Discover\"\n                }, void 0, false, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'saved' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'),\n                    onClick: ()=>onTabChange('saved'),\n                    children: [\n                        \"Saved\",\n                        savedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                            children: savedCount\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                            lineNumber: 49,\n                            columnNumber: 13\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 43,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'applied' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'),\n                    onClick: ()=>onTabChange('applied'),\n                    children: [\n                        \"Applied\",\n                        appliedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                            children: appliedCount\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                            lineNumber: 60,\n                            columnNumber: 13\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 54,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n            lineNumber: 36,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ConnectNavigation, \"fc40J9m/HfZ+zASIHmmVi2o3VOI=\", false, function() {\n    return [\n        next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter,\n        _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__.useAuth\n    ];\n});\n_c = ConnectNavigation;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConnectNavigation);\nvar _c;\n$RefreshReg$(_c, \"ConnectNavigation\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL2Nvbm5lY3QvQ29ubmVjdE5hdmlnYXRpb24udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUV3QztBQUNJO0FBQ0g7QUFDUTtBQVNqRCxNQUFNSyxvQkFBc0Q7UUFBQyxFQUMzREMsU0FBUyxFQUNUQyxXQUFXLEVBQ1hDLGFBQWEsQ0FBQyxFQUNkQyxlQUFlLENBQUMsRUFDakI7O0lBQ0MsTUFBTUMsU0FBU1IsMERBQVNBO0lBQ3hCLE1BQU0sQ0FBQ1MsbUJBQW1CQyxxQkFBcUIsR0FBR1gsK0NBQVFBLENBQUM7SUFDM0QsTUFBTSxFQUFFWSxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFLEdBQUdYLDhEQUFPQTtJQUUzQyxNQUFNWSxnQkFBZ0I7UUFDcEIsSUFBSTtZQUNGLE1BQU1iLGtEQUFJQSxDQUFDWSxPQUFPO1lBQ2xCTCxPQUFPTyxJQUFJLENBQUM7UUFDZCxFQUFFLE9BQU9DLE9BQU87WUFDZEMsUUFBUUQsS0FBSyxDQUFDLHNCQUFzQkE7UUFDdEM7SUFDRjtJQUVBLHFCQUNFLDhEQUFDRTtRQUFJQyxXQUFVO2tCQUNiLDRFQUFDRDtZQUFJQyxXQUFVOzs4QkFDYiw4REFBQ0Q7b0JBQ0NDLFdBQVcsaUVBQXdLLE9BQXZHZixjQUFjLGFBQWEsZ0RBQWdEO29CQUN2SmdCLFNBQVMsSUFBTWYsWUFBWTs4QkFDNUI7Ozs7Ozs4QkFHRCw4REFBQ2E7b0JBQ0NDLFdBQVcsaUVBQXFLLE9BQXBHZixjQUFjLFVBQVUsZ0RBQWdEO29CQUNwSmdCLFNBQVMsSUFBTWYsWUFBWTs7d0JBQzVCO3dCQUVFQyxhQUFhLG1CQUNaLDhEQUFDZTs0QkFBS0YsV0FBVTtzQ0FDYmI7Ozs7Ozs7Ozs7Ozs4QkFJUCw4REFBQ1k7b0JBQ0NDLFdBQVcsaUVBQXVLLE9BQXRHZixjQUFjLFlBQVksZ0RBQWdEO29CQUN0SmdCLFNBQVMsSUFBTWYsWUFBWTs7d0JBQzVCO3dCQUVFRSxlQUFlLG1CQUNkLDhEQUFDYzs0QkFBS0YsV0FBVTtzQ0FDYlo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT2Y7R0FyRE1KOztRQU1XSCxzREFBU0E7UUFFWUUsMERBQU9BOzs7S0FSdkNDO0FBdUROLGlFQUFlQSxpQkFBaUJBLEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbGV4aHN1L0Rlc2t0b3AvZnJ1aXRib3kvZnJ1aXRpb24vZnJvbnRlbmQvc3JjL2NvbXBvbmVudHMvY29ubmVjdC9Db25uZWN0TmF2aWdhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnO1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L25hdmlnYXRpb24nO1xuaW1wb3J0IHsgYXV0aCB9IGZyb20gJ0AvY29uZmlnL2ZpcmViYXNlJztcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tICdAL2NvbnRleHRzL0F1dGhDb250ZXh0JztcblxuaW50ZXJmYWNlIENvbm5lY3ROYXZpZ2F0aW9uUHJvcHMge1xuICBhY3RpdmVUYWI6ICdkaXNjb3ZlcicgfCAnc2F2ZWQnIHwgJ2FwcGxpZWQnO1xuICBvblRhYkNoYW5nZTogKHRhYjogJ2Rpc2NvdmVyJyB8ICdzYXZlZCcgfCAnYXBwbGllZCcpID0+IHZvaWQ7XG4gIHNhdmVkQ291bnQ/OiBudW1iZXI7XG4gIGFwcGxpZWRDb3VudD86IG51bWJlcjtcbn1cblxuY29uc3QgQ29ubmVjdE5hdmlnYXRpb246IFJlYWN0LkZDPENvbm5lY3ROYXZpZ2F0aW9uUHJvcHM+ID0gKHsgXG4gIGFjdGl2ZVRhYiwgXG4gIG9uVGFiQ2hhbmdlLFxuICBzYXZlZENvdW50ID0gMCxcbiAgYXBwbGllZENvdW50ID0gMFxufSkgPT4ge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgW2lzUHJvZmlsZU1lbnVPcGVuLCBzZXRJc1Byb2ZpbGVNZW51T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IHsgdXNlciwgdXNlckRhdGEsIHNpZ25PdXQgfSA9IHVzZUF1dGgoKTtcblxuICBjb25zdCBoYW5kbGVTaWduT3V0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhdXRoLnNpZ25PdXQoKTtcbiAgICAgIHJvdXRlci5wdXNoKCcvZGV2ZWxvcG1lbnQvbG9naW4nKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2lnbmluZyBvdXQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBvdmVyZmxvdy12aXNpYmxlIHJlbGF0aXZlIGZsZXgtd3JhcCBnYXAtNSBqdXN0aWZ5LWNlbnRlciBweC02IHB5LTMuNSB3LWZ1bGwgYmctd2hpdGUgYm9yZGVyIGJvcmRlci1zb2xpZCBib3JkZXItbmV1dHJhbC0yMDAgc2hhZG93LW1kIHJvdW5kZWQtMnhsIG1heC13LVsxMDAlXSBteC1hdXRvIG1iLTRcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMTAgaXRlbXMtY2VudGVyIHRleHQtbGcgdGV4dC1jZW50ZXIgdGV4dC12aW9sZXQtOTAwIHdoaXRlc3BhY2Utbm93cmFwIG1heC1tZDptYXgtdy1mdWxsXCI+XG4gICAgICAgIDxkaXYgXG4gICAgICAgICAgY2xhc3NOYW1lPXtgc2VsZi1zdHJldGNoIHB4LTUgcHktMiByb3VuZGVkLTN4bCBtYXgtbWQ6cHgtNSBjdXJzb3ItcG9pbnRlciAke2FjdGl2ZVRhYiA9PT0gJ2Rpc2NvdmVyJyA/ICdiZy1wdXJwbGUtMjAwIGZvbnQtc2VtaWJvbGQgdGV4dC12aW9sZXQtOTAwJyA6ICdmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwJ31gfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiQ2hhbmdlKCdkaXNjb3ZlcicpfVxuICAgICAgICA+XG4gICAgICAgICAgRGlzY292ZXJcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgXG4gICAgICAgICAgY2xhc3NOYW1lPXtgc2VsZi1zdHJldGNoIHB4LTUgcHktMiByb3VuZGVkLTN4bCBtYXgtbWQ6cHgtNSBjdXJzb3ItcG9pbnRlciAke2FjdGl2ZVRhYiA9PT0gJ3NhdmVkJyA/ICdiZy1wdXJwbGUtMjAwIGZvbnQtc2VtaWJvbGQgdGV4dC12aW9sZXQtOTAwJyA6ICdmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwJ31gfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiQ2hhbmdlKCdzYXZlZCcpfVxuICAgICAgICA+XG4gICAgICAgICAgU2F2ZWRcbiAgICAgICAgICB7c2F2ZWRDb3VudCA+IDAgJiYgKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMiBiZy1wdXJwbGUtMzAwIHRleHQtcHVycGxlLTgwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+XG4gICAgICAgICAgICAgIHtzYXZlZENvdW50fVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IFxuICAgICAgICAgIGNsYXNzTmFtZT17YHNlbGYtc3RyZXRjaCBweC01IHB5LTIgcm91bmRlZC0zeGwgbWF4LW1kOnB4LTUgY3Vyc29yLXBvaW50ZXIgJHthY3RpdmVUYWIgPT09ICdhcHBsaWVkJyA/ICdiZy1wdXJwbGUtMjAwIGZvbnQtc2VtaWJvbGQgdGV4dC12aW9sZXQtOTAwJyA6ICdmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwJ31gfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiQ2hhbmdlKCdhcHBsaWVkJyl9XG4gICAgICAgID5cbiAgICAgICAgICBBcHBsaWVkXG4gICAgICAgICAge2FwcGxpZWRDb3VudCA+IDAgJiYgKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMiBiZy1wdXJwbGUtMzAwIHRleHQtcHVycGxlLTgwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+XG4gICAgICAgICAgICAgIHthcHBsaWVkQ291bnR9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbm5lY3ROYXZpZ2F0aW9uOyAiXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZVJvdXRlciIsImF1dGgiLCJ1c2VBdXRoIiwiQ29ubmVjdE5hdmlnYXRpb24iLCJhY3RpdmVUYWIiLCJvblRhYkNoYW5nZSIsInNhdmVkQ291bnQiLCJhcHBsaWVkQ291bnQiLCJyb3V0ZXIiLCJpc1Byb2ZpbGVNZW51T3BlbiIsInNldElzUHJvZmlsZU1lbnVPcGVuIiwidXNlciIsInVzZXJEYXRhIiwic2lnbk91dCIsImhhbmRsZVNpZ25PdXQiLCJwdXNoIiwiZXJyb3IiLCJjb25zb2xlIiwiZGl2IiwiY2xhc3NOYW1lIiwib25DbGljayIsInNwYW4iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/connect/ConnectNavigation.tsx\n"));

/***/ })

});