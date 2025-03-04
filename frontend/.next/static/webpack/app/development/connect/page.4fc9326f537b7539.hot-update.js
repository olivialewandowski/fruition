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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/navigation */ \"(app-pages-browser)/./node_modules/next/dist/api/navigation.js\");\n/* harmony import */ var _config_firebase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/config/firebase */ \"(app-pages-browser)/./src/config/firebase.ts\");\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/contexts/AuthContext */ \"(app-pages-browser)/./src/contexts/AuthContext.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\nconst ConnectNavigation = (param)=>{\n    let { activeTab, onTabChange, savedCount = 0, appliedCount = 0 } = param;\n    var _auth_currentUser_email, _auth_currentUser;\n    _s();\n    const router = (0,next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [isProfileMenuOpen, setIsProfileMenuOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const { user, userData, signOut } = (0,_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__.useAuth)();\n    const handleSignOut = async ()=>{\n        try {\n            await _config_firebase__WEBPACK_IMPORTED_MODULE_3__.auth.signOut();\n            router.push('/development/login');\n        } catch (error) {\n            console.error('Error signing out:', error);\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex overflow-visible relative flex-wrap gap-5 justify-center px-6 py-3.5 w-full bg-white border border-solid border-neutral-200 shadow-lg rounded-2xl max-w-[calc(100%-1rem)] mb-4\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex gap-10 items-center text-2xl font-medium text-center text-black whitespace-nowrap max-md:max-w-full\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'discover' ? 'bg-purple-200' : ''),\n                        onClick: ()=>onTabChange('discover'),\n                        children: \"Discover\"\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                        lineNumber: 37,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'saved' ? 'bg-purple-200' : ''),\n                        onClick: ()=>onTabChange('saved'),\n                        children: [\n                            \"Saved\",\n                            savedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                                children: savedCount\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                                lineNumber: 49,\n                                columnNumber: 13\n                            }, undefined)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                        lineNumber: 43,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'applied' ? 'bg-purple-200' : ''),\n                        onClick: ()=>onTabChange('applied'),\n                        children: [\n                            \"Applied\",\n                            appliedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                                children: appliedCount\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                                lineNumber: 60,\n                                columnNumber: 13\n                            }, undefined)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                        lineNumber: 54,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                lineNumber: 36,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex gap-7 self-start relative\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: ()=>setIsProfileMenuOpen(!isProfileMenuOpen),\n                        className: \"w-[34px] h-[34px] rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-medium\",\n                        children: ((_auth_currentUser = _config_firebase__WEBPACK_IMPORTED_MODULE_3__.auth.currentUser) === null || _auth_currentUser === void 0 ? void 0 : (_auth_currentUser_email = _auth_currentUser.email) === null || _auth_currentUser_email === void 0 ? void 0 : _auth_currentUser_email[0].toUpperCase()) || 'U'\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                        lineNumber: 68,\n                        columnNumber: 9\n                    }, undefined),\n                    isProfileMenuOpen && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"absolute right-0 top-[calc(100%+0.5rem)] w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"py-1\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: ()=>{\n                                        router.push('/development/profile');\n                                        setIsProfileMenuOpen(false);\n                                    },\n                                    className: \"block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50\",\n                                    children: \"Edit Profile\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                                    lineNumber: 78,\n                                    columnNumber: 15\n                                }, undefined),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: ()=>{\n                                        handleSignOut();\n                                        setIsProfileMenuOpen(false);\n                                    },\n                                    className: \"block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 border-t border-gray-100\",\n                                    children: \"Sign Out\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                                    lineNumber: 87,\n                                    columnNumber: 15\n                                }, undefined)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                            lineNumber: 77,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                        lineNumber: 76,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                lineNumber: 67,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ConnectNavigation, \"fc40J9m/HfZ+zASIHmmVi2o3VOI=\", false, function() {\n    return [\n        next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter,\n        _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__.useAuth\n    ];\n});\n_c = ConnectNavigation;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConnectNavigation);\nvar _c;\n$RefreshReg$(_c, \"ConnectNavigation\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL2Nvbm5lY3QvQ29ubmVjdE5hdmlnYXRpb24udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUV3QztBQUNJO0FBQ0g7QUFDUTtBQVNqRCxNQUFNSyxvQkFBc0Q7UUFBQyxFQUMzREMsU0FBUyxFQUNUQyxXQUFXLEVBQ1hDLGFBQWEsQ0FBQyxFQUNkQyxlQUFlLENBQUMsRUFDakI7UUFvRFVOLHlCQUFBQTs7SUFuRFQsTUFBTU8sU0FBU1IsMERBQVNBO0lBQ3hCLE1BQU0sQ0FBQ1MsbUJBQW1CQyxxQkFBcUIsR0FBR1gsK0NBQVFBLENBQUM7SUFDM0QsTUFBTSxFQUFFWSxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFLEdBQUdYLDhEQUFPQTtJQUUzQyxNQUFNWSxnQkFBZ0I7UUFDcEIsSUFBSTtZQUNGLE1BQU1iLGtEQUFJQSxDQUFDWSxPQUFPO1lBQ2xCTCxPQUFPTyxJQUFJLENBQUM7UUFDZCxFQUFFLE9BQU9DLE9BQU87WUFDZEMsUUFBUUQsS0FBSyxDQUFDLHNCQUFzQkE7UUFDdEM7SUFDRjtJQUVBLHFCQUNFLDhEQUFDRTtRQUFJQyxXQUFVOzswQkFDYiw4REFBQ0Q7Z0JBQUlDLFdBQVU7O2tDQUNiLDhEQUFDRDt3QkFDQ0MsV0FBVyxpRUFBaUgsT0FBaERmLGNBQWMsYUFBYSxrQkFBa0I7d0JBQ3pIZ0IsU0FBUyxJQUFNZixZQUFZO2tDQUM1Qjs7Ozs7O2tDQUdELDhEQUFDYTt3QkFDQ0MsV0FBVyxpRUFBOEcsT0FBN0NmLGNBQWMsVUFBVSxrQkFBa0I7d0JBQ3RIZ0IsU0FBUyxJQUFNZixZQUFZOzs0QkFDNUI7NEJBRUVDLGFBQWEsbUJBQ1osOERBQUNlO2dDQUFLRixXQUFVOzBDQUNiYjs7Ozs7Ozs7Ozs7O2tDQUlQLDhEQUFDWTt3QkFDQ0MsV0FBVyxpRUFBZ0gsT0FBL0NmLGNBQWMsWUFBWSxrQkFBa0I7d0JBQ3hIZ0IsU0FBUyxJQUFNZixZQUFZOzs0QkFDNUI7NEJBRUVFLGVBQWUsbUJBQ2QsOERBQUNjO2dDQUFLRixXQUFVOzBDQUNiWjs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQU1ULDhEQUFDVztnQkFBSUMsV0FBVTs7a0NBQ2IsOERBQUNHO3dCQUNDRixTQUFTLElBQU1WLHFCQUFxQixDQUFDRDt3QkFDckNVLFdBQVU7a0NBRVRsQixFQUFBQSxvQkFBQUEsa0RBQUlBLENBQUNzQixXQUFXLGNBQWhCdEIseUNBQUFBLDBCQUFBQSxrQkFBa0J1QixLQUFLLGNBQXZCdkIsOENBQUFBLHVCQUF5QixDQUFDLEVBQUUsQ0FBQ3dCLFdBQVcsT0FBTTs7Ozs7O29CQUdoRGhCLG1DQUNDLDhEQUFDUzt3QkFBSUMsV0FBVTtrQ0FDYiw0RUFBQ0Q7NEJBQUlDLFdBQVU7OzhDQUNiLDhEQUFDRztvQ0FDQ0YsU0FBUzt3Q0FDUFosT0FBT08sSUFBSSxDQUFDO3dDQUNaTCxxQkFBcUI7b0NBQ3ZCO29DQUNBUyxXQUFVOzhDQUNYOzs7Ozs7OENBR0QsOERBQUNHO29DQUNDRixTQUFTO3dDQUNQTjt3Q0FDQUoscUJBQXFCO29DQUN2QjtvQ0FDQVMsV0FBVTs4Q0FDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTZjtHQXZGTWhCOztRQU1XSCxzREFBU0E7UUFFWUUsMERBQU9BOzs7S0FSdkNDO0FBeUZOLGlFQUFlQSxpQkFBaUJBLEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbGV4aHN1L0Rlc2t0b3AvZnJ1aXRib3kvZnJ1aXRpb24vZnJvbnRlbmQvc3JjL2NvbXBvbmVudHMvY29ubmVjdC9Db25uZWN0TmF2aWdhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnO1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L25hdmlnYXRpb24nO1xuaW1wb3J0IHsgYXV0aCB9IGZyb20gJ0AvY29uZmlnL2ZpcmViYXNlJztcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tICdAL2NvbnRleHRzL0F1dGhDb250ZXh0JztcblxuaW50ZXJmYWNlIENvbm5lY3ROYXZpZ2F0aW9uUHJvcHMge1xuICBhY3RpdmVUYWI6ICdkaXNjb3ZlcicgfCAnc2F2ZWQnIHwgJ2FwcGxpZWQnO1xuICBvblRhYkNoYW5nZTogKHRhYjogJ2Rpc2NvdmVyJyB8ICdzYXZlZCcgfCAnYXBwbGllZCcpID0+IHZvaWQ7XG4gIHNhdmVkQ291bnQ/OiBudW1iZXI7XG4gIGFwcGxpZWRDb3VudD86IG51bWJlcjtcbn1cblxuY29uc3QgQ29ubmVjdE5hdmlnYXRpb246IFJlYWN0LkZDPENvbm5lY3ROYXZpZ2F0aW9uUHJvcHM+ID0gKHsgXG4gIGFjdGl2ZVRhYiwgXG4gIG9uVGFiQ2hhbmdlLFxuICBzYXZlZENvdW50ID0gMCxcbiAgYXBwbGllZENvdW50ID0gMFxufSkgPT4ge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgW2lzUHJvZmlsZU1lbnVPcGVuLCBzZXRJc1Byb2ZpbGVNZW51T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IHsgdXNlciwgdXNlckRhdGEsIHNpZ25PdXQgfSA9IHVzZUF1dGgoKTtcblxuICBjb25zdCBoYW5kbGVTaWduT3V0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhdXRoLnNpZ25PdXQoKTtcbiAgICAgIHJvdXRlci5wdXNoKCcvZGV2ZWxvcG1lbnQvbG9naW4nKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2lnbmluZyBvdXQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBvdmVyZmxvdy12aXNpYmxlIHJlbGF0aXZlIGZsZXgtd3JhcCBnYXAtNSBqdXN0aWZ5LWNlbnRlciBweC02IHB5LTMuNSB3LWZ1bGwgYmctd2hpdGUgYm9yZGVyIGJvcmRlci1zb2xpZCBib3JkZXItbmV1dHJhbC0yMDAgc2hhZG93LWxnIHJvdW5kZWQtMnhsIG1heC13LVtjYWxjKDEwMCUtMXJlbSldIG1iLTRcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMTAgaXRlbXMtY2VudGVyIHRleHQtMnhsIGZvbnQtbWVkaXVtIHRleHQtY2VudGVyIHRleHQtYmxhY2sgd2hpdGVzcGFjZS1ub3dyYXAgbWF4LW1kOm1heC13LWZ1bGxcIj5cbiAgICAgICAgPGRpdiBcbiAgICAgICAgICBjbGFzc05hbWU9e2BzZWxmLXN0cmV0Y2ggcHgtNSBweS0yIHJvdW5kZWQtM3hsIG1heC1tZDpweC01IGN1cnNvci1wb2ludGVyICR7YWN0aXZlVGFiID09PSAnZGlzY292ZXInID8gJ2JnLXB1cnBsZS0yMDAnIDogJyd9YH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRhYkNoYW5nZSgnZGlzY292ZXInKX1cbiAgICAgICAgPlxuICAgICAgICAgIERpc2NvdmVyXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IFxuICAgICAgICAgIGNsYXNzTmFtZT17YHNlbGYtc3RyZXRjaCBweC01IHB5LTIgcm91bmRlZC0zeGwgbWF4LW1kOnB4LTUgY3Vyc29yLXBvaW50ZXIgJHthY3RpdmVUYWIgPT09ICdzYXZlZCcgPyAnYmctcHVycGxlLTIwMCcgOiAnJ31gfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiQ2hhbmdlKCdzYXZlZCcpfVxuICAgICAgICA+XG4gICAgICAgICAgU2F2ZWRcbiAgICAgICAgICB7c2F2ZWRDb3VudCA+IDAgJiYgKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMiBiZy1wdXJwbGUtMzAwIHRleHQtcHVycGxlLTgwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+XG4gICAgICAgICAgICAgIHtzYXZlZENvdW50fVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IFxuICAgICAgICAgIGNsYXNzTmFtZT17YHNlbGYtc3RyZXRjaCBweC01IHB5LTIgcm91bmRlZC0zeGwgbWF4LW1kOnB4LTUgY3Vyc29yLXBvaW50ZXIgJHthY3RpdmVUYWIgPT09ICdhcHBsaWVkJyA/ICdiZy1wdXJwbGUtMjAwJyA6ICcnfWB9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25UYWJDaGFuZ2UoJ2FwcGxpZWQnKX1cbiAgICAgICAgPlxuICAgICAgICAgIEFwcGxpZWRcbiAgICAgICAgICB7YXBwbGllZENvdW50ID4gMCAmJiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJtbC0yIGJnLXB1cnBsZS0zMDAgdGV4dC1wdXJwbGUtODAwIHRleHQteHMgZm9udC1zZW1pYm9sZCBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGxcIj5cbiAgICAgICAgICAgICAge2FwcGxpZWRDb3VudH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTcgc2VsZi1zdGFydCByZWxhdGl2ZVwiPlxuICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzUHJvZmlsZU1lbnVPcGVuKCFpc1Byb2ZpbGVNZW51T3Blbil9XG4gICAgICAgICAgY2xhc3NOYW1lPVwidy1bMzRweF0gaC1bMzRweF0gcm91bmRlZC1mdWxsIGJnLXB1cnBsZS0yMDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC1wdXJwbGUtODAwIGZvbnQtbWVkaXVtXCJcbiAgICAgICAgPlxuICAgICAgICAgIHthdXRoLmN1cnJlbnRVc2VyPy5lbWFpbD8uWzBdLnRvVXBwZXJDYXNlKCkgfHwgJ1UnfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgXG4gICAgICAgIHtpc1Byb2ZpbGVNZW51T3BlbiAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC0wIHRvcC1bY2FsYygxMDAlKzAuNXJlbSldIHctNDggcm91bmRlZC1tZCBzaGFkb3ctbGcgYmctd2hpdGUgcmluZy0xIHJpbmctYmxhY2sgcmluZy1vcGFjaXR5LTUgei01MFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweS0xXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICByb3V0ZXIucHVzaCgnL2RldmVsb3BtZW50L3Byb2ZpbGUnKTtcbiAgICAgICAgICAgICAgICAgIHNldElzUHJvZmlsZU1lbnVPcGVuKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJsb2NrIHctZnVsbCB0ZXh0LWxlZnQgcHgtNCBweS0yIHRleHQtc20gdGV4dC1ncmF5LTcwMCBob3ZlcjpiZy1wdXJwbGUtNTBcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgRWRpdCBQcm9maWxlXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaGFuZGxlU2lnbk91dCgpO1xuICAgICAgICAgICAgICAgICAgc2V0SXNQcm9maWxlTWVudU9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmxvY2sgdy1mdWxsIHRleHQtbGVmdCBweC00IHB5LTIgdGV4dC1zbSB0ZXh0LWdyYXktNzAwIGhvdmVyOmJnLXB1cnBsZS01MCBib3JkZXItdCBib3JkZXItZ3JheS0xMDBcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgU2lnbiBPdXRcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29ubmVjdE5hdmlnYXRpb247ICJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZVN0YXRlIiwidXNlUm91dGVyIiwiYXV0aCIsInVzZUF1dGgiLCJDb25uZWN0TmF2aWdhdGlvbiIsImFjdGl2ZVRhYiIsIm9uVGFiQ2hhbmdlIiwic2F2ZWRDb3VudCIsImFwcGxpZWRDb3VudCIsInJvdXRlciIsImlzUHJvZmlsZU1lbnVPcGVuIiwic2V0SXNQcm9maWxlTWVudU9wZW4iLCJ1c2VyIiwidXNlckRhdGEiLCJzaWduT3V0IiwiaGFuZGxlU2lnbk91dCIsInB1c2giLCJlcnJvciIsImNvbnNvbGUiLCJkaXYiLCJjbGFzc05hbWUiLCJvbkNsaWNrIiwic3BhbiIsImJ1dHRvbiIsImN1cnJlbnRVc2VyIiwiZW1haWwiLCJ0b1VwcGVyQ2FzZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/connect/ConnectNavigation.tsx\n"));

/***/ })

});