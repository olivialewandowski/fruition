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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/navigation */ \"(app-pages-browser)/./node_modules/next/dist/api/navigation.js\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\nconst ConnectNavigation = (param)=>{\n    let { activeTab, onTabChange, savedCount = 0, appliedCount = 0 } = param;\n    _s();\n    const router = (0,next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex overflow-visible relative flex-wrap gap-5 justify-center px-6 py-3.5 w-full bg-white border border-solid border-neutral-200 shadow-md rounded-2xl max-w-full mb-4\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"flex gap-10 items-center text-2xl font-medium text-center text-black whitespace-nowrap max-md:max-w-full\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'discover' ? 'bg-purple-200' : ''),\n                    onClick: ()=>onTabChange('discover'),\n                    children: \"Discover\"\n                }, void 0, false, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 26,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'saved' ? 'bg-purple-200' : ''),\n                    onClick: ()=>onTabChange('saved'),\n                    children: [\n                        \"Saved\",\n                        savedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                            children: savedCount\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                            lineNumber: 38,\n                            columnNumber: 13\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 32,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer \".concat(activeTab === 'applied' ? 'bg-purple-200' : ''),\n                    onClick: ()=>onTabChange('applied'),\n                    children: [\n                        \"Applied\",\n                        appliedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full\",\n                            children: appliedCount\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                            lineNumber: 49,\n                            columnNumber: 13\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n                    lineNumber: 43,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n            lineNumber: 25,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ConnectNavigation.tsx\",\n        lineNumber: 24,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ConnectNavigation, \"fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=\", false, function() {\n    return [\n        next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter\n    ];\n});\n_c = ConnectNavigation;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConnectNavigation);\nvar _c;\n$RefreshReg$(_c, \"ConnectNavigation\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL2Nvbm5lY3QvQ29ubmVjdE5hdmlnYXRpb24udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFd0M7QUFDSTtBQVc1QyxNQUFNRSxvQkFBc0Q7UUFBQyxFQUMzREMsU0FBUyxFQUNUQyxXQUFXLEVBQ1hDLGFBQWEsQ0FBQyxFQUNkQyxlQUFlLENBQUMsRUFDakI7O0lBQ0MsTUFBTUMsU0FBU04sMERBQVNBO0lBRXhCLHFCQUNFLDhEQUFDTztRQUFJQyxXQUFVO2tCQUNiLDRFQUFDRDtZQUFJQyxXQUFVOzs4QkFDYiw4REFBQ0Q7b0JBQ0NDLFdBQVcsaUVBQWlILE9BQWhETixjQUFjLGFBQWEsa0JBQWtCO29CQUN6SE8sU0FBUyxJQUFNTixZQUFZOzhCQUM1Qjs7Ozs7OzhCQUdELDhEQUFDSTtvQkFDQ0MsV0FBVyxpRUFBOEcsT0FBN0NOLGNBQWMsVUFBVSxrQkFBa0I7b0JBQ3RITyxTQUFTLElBQU1OLFlBQVk7O3dCQUM1Qjt3QkFFRUMsYUFBYSxtQkFDWiw4REFBQ007NEJBQUtGLFdBQVU7c0NBQ2JKOzs7Ozs7Ozs7Ozs7OEJBSVAsOERBQUNHO29CQUNDQyxXQUFXLGlFQUFnSCxPQUEvQ04sY0FBYyxZQUFZLGtCQUFrQjtvQkFDeEhPLFNBQVMsSUFBTU4sWUFBWTs7d0JBQzVCO3dCQUVFRSxlQUFlLG1CQUNkLDhEQUFDSzs0QkFBS0YsV0FBVTtzQ0FDYkg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT2Y7R0ExQ01KOztRQU1XRCxzREFBU0E7OztLQU5wQkM7QUE0Q04saUVBQWVBLGlCQUFpQkEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL2FsZXhoc3UvRGVza3RvcC9mcnVpdGJveS9mcnVpdGlvbi9mcm9udGVuZC9zcmMvY29tcG9uZW50cy9jb25uZWN0L0Nvbm5lY3ROYXZpZ2F0aW9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvbmF2aWdhdGlvbic7XG5pbXBvcnQgeyBhdXRoIH0gZnJvbSAnQC9jb25maWcvZmlyZWJhc2UnO1xuaW1wb3J0IHsgdXNlQXV0aCB9IGZyb20gJ0AvY29udGV4dHMvQXV0aENvbnRleHQnO1xuXG5pbnRlcmZhY2UgQ29ubmVjdE5hdmlnYXRpb25Qcm9wcyB7XG4gIGFjdGl2ZVRhYjogJ2Rpc2NvdmVyJyB8ICdzYXZlZCcgfCAnYXBwbGllZCc7XG4gIG9uVGFiQ2hhbmdlOiAodGFiOiAnZGlzY292ZXInIHwgJ3NhdmVkJyB8ICdhcHBsaWVkJykgPT4gdm9pZDtcbiAgc2F2ZWRDb3VudD86IG51bWJlcjtcbiAgYXBwbGllZENvdW50PzogbnVtYmVyO1xufVxuXG5jb25zdCBDb25uZWN0TmF2aWdhdGlvbjogUmVhY3QuRkM8Q29ubmVjdE5hdmlnYXRpb25Qcm9wcz4gPSAoeyBcbiAgYWN0aXZlVGFiLCBcbiAgb25UYWJDaGFuZ2UsXG4gIHNhdmVkQ291bnQgPSAwLFxuICBhcHBsaWVkQ291bnQgPSAwXG59KSA9PiB7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IG92ZXJmbG93LXZpc2libGUgcmVsYXRpdmUgZmxleC13cmFwIGdhcC01IGp1c3RpZnktY2VudGVyIHB4LTYgcHktMy41IHctZnVsbCBiZy13aGl0ZSBib3JkZXIgYm9yZGVyLXNvbGlkIGJvcmRlci1uZXV0cmFsLTIwMCBzaGFkb3ctbWQgcm91bmRlZC0yeGwgbWF4LXctZnVsbCBtYi00XCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTEwIGl0ZW1zLWNlbnRlciB0ZXh0LTJ4bCBmb250LW1lZGl1bSB0ZXh0LWNlbnRlciB0ZXh0LWJsYWNrIHdoaXRlc3BhY2Utbm93cmFwIG1heC1tZDptYXgtdy1mdWxsXCI+XG4gICAgICAgIDxkaXYgXG4gICAgICAgICAgY2xhc3NOYW1lPXtgc2VsZi1zdHJldGNoIHB4LTUgcHktMiByb3VuZGVkLTN4bCBtYXgtbWQ6cHgtNSBjdXJzb3ItcG9pbnRlciAke2FjdGl2ZVRhYiA9PT0gJ2Rpc2NvdmVyJyA/ICdiZy1wdXJwbGUtMjAwJyA6ICcnfWB9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25UYWJDaGFuZ2UoJ2Rpc2NvdmVyJyl9XG4gICAgICAgID5cbiAgICAgICAgICBEaXNjb3ZlclxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBcbiAgICAgICAgICBjbGFzc05hbWU9e2BzZWxmLXN0cmV0Y2ggcHgtNSBweS0yIHJvdW5kZWQtM3hsIG1heC1tZDpweC01IGN1cnNvci1wb2ludGVyICR7YWN0aXZlVGFiID09PSAnc2F2ZWQnID8gJ2JnLXB1cnBsZS0yMDAnIDogJyd9YH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRhYkNoYW5nZSgnc2F2ZWQnKX1cbiAgICAgICAgPlxuICAgICAgICAgIFNhdmVkXG4gICAgICAgICAge3NhdmVkQ291bnQgPiAwICYmIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm1sLTIgYmctcHVycGxlLTMwMCB0ZXh0LXB1cnBsZS04MDAgdGV4dC14cyBmb250LXNlbWlib2xkIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbFwiPlxuICAgICAgICAgICAgICB7c2F2ZWRDb3VudH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBcbiAgICAgICAgICBjbGFzc05hbWU9e2BzZWxmLXN0cmV0Y2ggcHgtNSBweS0yIHJvdW5kZWQtM3hsIG1heC1tZDpweC01IGN1cnNvci1wb2ludGVyICR7YWN0aXZlVGFiID09PSAnYXBwbGllZCcgPyAnYmctcHVycGxlLTIwMCcgOiAnJ31gfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiQ2hhbmdlKCdhcHBsaWVkJyl9XG4gICAgICAgID5cbiAgICAgICAgICBBcHBsaWVkXG4gICAgICAgICAge2FwcGxpZWRDb3VudCA+IDAgJiYgKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMiBiZy1wdXJwbGUtMzAwIHRleHQtcHVycGxlLTgwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+XG4gICAgICAgICAgICAgIHthcHBsaWVkQ291bnR9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbm5lY3ROYXZpZ2F0aW9uOyAiXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VSb3V0ZXIiLCJDb25uZWN0TmF2aWdhdGlvbiIsImFjdGl2ZVRhYiIsIm9uVGFiQ2hhbmdlIiwic2F2ZWRDb3VudCIsImFwcGxpZWRDb3VudCIsInJvdXRlciIsImRpdiIsImNsYXNzTmFtZSIsIm9uQ2xpY2siLCJzcGFuIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/connect/ConnectNavigation.tsx\n"));

/***/ })

});