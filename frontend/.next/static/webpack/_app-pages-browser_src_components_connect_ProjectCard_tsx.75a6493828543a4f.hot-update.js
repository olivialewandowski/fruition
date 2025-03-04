"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("_app-pages-browser_src_components_connect_ProjectCard_tsx",{

/***/ "(app-pages-browser)/./src/components/connect/ProjectCard.tsx":
/*!************************************************!*\
  !*** ./src/components/connect/ProjectCard.tsx ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var framer_motion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! framer-motion */ \"(app-pages-browser)/./node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs\");\n\nvar _s = $RefreshSig$();\n\n\nconst ProjectCard = (param)=>{\n    let { project, swipeDirection, onDecline, onSave, onApply } = param;\n    _s();\n    const [animateDirection, setAnimateDirection] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [animationPhase, setAnimationPhase] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('initial');\n    const [mounted, setMounted] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    // Set mounted state on client side\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"ProjectCard.useEffect\": ()=>{\n            setMounted(true);\n        }\n    }[\"ProjectCard.useEffect\"], []);\n    // Reset animation when project changes\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"ProjectCard.useEffect\": ()=>{\n            if (!project) return;\n            setAnimateDirection(null);\n            setAnimationPhase('initial');\n        }\n    }[\"ProjectCard.useEffect\"], [\n        project\n    ]);\n    // Handle animation based on swipe direction\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"ProjectCard.useEffect\": ()=>{\n            if (!swipeDirection || !mounted) {\n                return;\n            }\n            setAnimateDirection(swipeDirection);\n            setAnimationPhase('bounce');\n            // First phase: bounce in direction - reduced from 300ms to 200ms\n            const bounceTimer = setTimeout({\n                \"ProjectCard.useEffect.bounceTimer\": ()=>{\n                    // For all actions (left, right, up), we exit after bounce\n                    setAnimationPhase('exit');\n                }\n            }[\"ProjectCard.useEffect.bounceTimer\"], 200);\n            return ({\n                \"ProjectCard.useEffect\": ()=>clearTimeout(bounceTimer)\n            })[\"ProjectCard.useEffect\"];\n        }\n    }[\"ProjectCard.useEffect\"], [\n        swipeDirection,\n        mounted\n    ]);\n    // Variants for card animations\n    const cardVariants = {\n        initial: {\n            x: 0,\n            y: 0,\n            scale: 1,\n            opacity: 1,\n            transition: {\n                type: 'spring',\n                stiffness: 400,\n                damping: 25\n            }\n        },\n        bounce: {\n            x: animateDirection === 'left' ? -40 : animateDirection === 'right' ? 40 : 0,\n            y: animateDirection === 'up' ? -40 : 0,\n            scale: 1.03,\n            opacity: 1,\n            transition: {\n                type: 'spring',\n                stiffness: 500,\n                damping: 20\n            }\n        },\n        exit: {\n            x: animateDirection === 'left' ? -1000 : animateDirection === 'right' ? 1000 : 0,\n            y: animateDirection === 'up' ? -1000 : 0,\n            opacity: 0,\n            transition: {\n                type: 'spring',\n                stiffness: 400,\n                damping: 25,\n                duration: 0.2\n            }\n        }\n    };\n    // If not mounted yet or project data is missing, show a loading placeholder\n    if (!mounted || !project || !project.id || !project.title) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl mb-8\",\n            style: {\n                minHeight: '500px'\n            },\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"animate-pulse\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"h-10 bg-gray-200 rounded w-3/4 mb-4\"\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                        lineNumber: 90,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"h-6 bg-gray-200 rounded w-1/2 mb-8\"\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                        lineNumber: 91,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"h-40 bg-gray-200 rounded mb-8\"\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                        lineNumber: 92,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"h-8 bg-gray-200 rounded w-1/4 mb-4\"\n                    }, void 0, false, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                        lineNumber: 93,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"flex flex-wrap gap-3 mb-8\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"h-10 bg-gray-200 rounded-full w-28\"\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                                lineNumber: 95,\n                                columnNumber: 13\n                            }, undefined),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"h-10 bg-gray-200 rounded-full w-36\"\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                                lineNumber: 96,\n                                columnNumber: 13\n                            }, undefined),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"h-10 bg-gray-200 rounded-full w-32\"\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                                lineNumber: 97,\n                                columnNumber: 13\n                            }, undefined)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                        lineNumber: 94,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                lineNumber: 89,\n                columnNumber: 9\n            }, undefined)\n        }, void 0, false, {\n            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n            lineNumber: 88,\n            columnNumber: 7\n        }, undefined);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(framer_motion__WEBPACK_IMPORTED_MODULE_2__.motion.div, {\n        className: \"bg-white rounded-2xl shadow-md border border-solid border-neutral-200 p-8 w-full max-w-[90%] mx-auto mb-8\",\n        style: {\n            minHeight: '750px',\n            display: 'flex',\n            flexDirection: 'column'\n        },\n        variants: cardVariants,\n        initial: \"initial\",\n        animate: animationPhase,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"flex-grow\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                    className: \"text-3xl font-bold text-gray-800 mb-2\",\n                    children: project.title\n                }, void 0, false, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                    lineNumber: 115,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                    className: \"text-xl text-violet-600 font-medium mb-6\",\n                    children: project.faculty ? \"\".concat(project.faculty, \" • \").concat(project.department || '') : 'Research Organization'\n                }, void 0, false, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                    lineNumber: 118,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"mb-8\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                            className: \"text-xl font-semibold text-gray-700 mt-6 mb-3\",\n                            children: \"Project Description\"\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 124,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-gray-600 text-lg leading-relaxed\",\n                            children: project.description || 'No description provided.'\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 125,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                            className: \"text-xl font-semibold text-gray-700 mt-6 mb-3\",\n                            children: \"Duration:\"\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 129,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-gray-600 text-lg leading-relaxed mb-4\",\n                            children: project.duration || 'Duration not specified.'\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 130,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                            className: \"text-xl font-semibold text-gray-700 mt-6 mb-3\",\n                            children: \"Commitment:\"\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 134,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-gray-600 text-lg leading-relaxed mb-4\",\n                            children: project.commitment || 'Commitment not specified.'\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 135,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                            className: \"text-xl font-semibold text-gray-700 mt-6 mb-3\",\n                            children: \"Skills:\"\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 139,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex flex-wrap gap-3\",\n                            children: project.skills && project.skills.length > 0 ? project.skills.map((skill, index)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    className: \"bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-lg font-medium\",\n                                    children: skill\n                                }, \"skill-\".concat(index, \"-\").concat(skill), false, {\n                                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                                    lineNumber: 143,\n                                    columnNumber: 17\n                                }, undefined)) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                className: \"text-gray-500 italic\",\n                                children: \"No specific skills listed\"\n                            }, void 0, false, {\n                                fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                                lineNumber: 151,\n                                columnNumber: 15\n                            }, undefined)\n                        }, void 0, false, {\n                            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                            lineNumber: 140,\n                            columnNumber: 11\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n                    lineNumber: 123,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n            lineNumber: 113,\n            columnNumber: 7\n        }, undefined)\n    }, \"card-motion-\".concat(project.id), false, {\n        fileName: \"/Users/alexhsu/Desktop/fruitboy/fruition/frontend/src/components/connect/ProjectCard.tsx\",\n        lineNumber: 105,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ProjectCard, \"1hFZ/BilCDsYBEAfJWO9KVulu7U=\");\n_c = ProjectCard;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProjectCard);\nvar _c;\n$RefreshReg$(_c, \"ProjectCard\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL2Nvbm5lY3QvUHJvamVjdENhcmQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBNEM7QUFFTDtBQVV2QyxNQUFNRyxjQUFjO1FBQUMsRUFBRUMsT0FBTyxFQUFFQyxjQUFjLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQW9COztJQUM1RixNQUFNLENBQUNDLGtCQUFrQkMsb0JBQW9CLEdBQUdWLCtDQUFRQSxDQUFpQztJQUN6RixNQUFNLENBQUNXLGdCQUFnQkMsa0JBQWtCLEdBQUdaLCtDQUFRQSxDQUFnQztJQUNwRixNQUFNLENBQUNhLFNBQVNDLFdBQVcsR0FBR2QsK0NBQVFBLENBQUM7SUFFdkMsbUNBQW1DO0lBQ25DQyxnREFBU0E7aUNBQUM7WUFDUmEsV0FBVztRQUNiO2dDQUFHLEVBQUU7SUFFTCx1Q0FBdUM7SUFDdkNiLGdEQUFTQTtpQ0FBQztZQUNSLElBQUksQ0FBQ0csU0FBUztZQUNkTSxvQkFBb0I7WUFDcEJFLGtCQUFrQjtRQUNwQjtnQ0FBRztRQUFDUjtLQUFRO0lBRVosNENBQTRDO0lBQzVDSCxnREFBU0E7aUNBQUM7WUFDUixJQUFJLENBQUNJLGtCQUFrQixDQUFDUSxTQUFTO2dCQUMvQjtZQUNGO1lBRUFILG9CQUFvQkw7WUFDcEJPLGtCQUFrQjtZQUVsQixpRUFBaUU7WUFDakUsTUFBTUcsY0FBY0M7cURBQVc7b0JBQzdCLDBEQUEwRDtvQkFDMURKLGtCQUFrQjtnQkFDcEI7b0RBQUc7WUFFSDt5Q0FBTyxJQUFNSyxhQUFhRjs7UUFDNUI7Z0NBQUc7UUFBQ1Y7UUFBZ0JRO0tBQVE7SUFFNUIsK0JBQStCO0lBQy9CLE1BQU1LLGVBQWU7UUFDbkJDLFNBQVM7WUFDUEMsR0FBRztZQUNIQyxHQUFHO1lBQ0hDLE9BQU87WUFDUEMsU0FBUztZQUNUQyxZQUFZO2dCQUNWQyxNQUFNO2dCQUNOQyxXQUFXO2dCQUNYQyxTQUFTO1lBQ1g7UUFDRjtRQUNBQyxRQUFRO1lBQ05SLEdBQUdYLHFCQUFxQixTQUFTLENBQUMsS0FBS0EscUJBQXFCLFVBQVUsS0FBSztZQUMzRVksR0FBR1oscUJBQXFCLE9BQU8sQ0FBQyxLQUFLO1lBQ3JDYSxPQUFPO1lBQ1BDLFNBQVM7WUFDVEMsWUFBWTtnQkFDVkMsTUFBTTtnQkFDTkMsV0FBVztnQkFDWEMsU0FBUztZQUNYO1FBQ0Y7UUFDQUUsTUFBTTtZQUNKVCxHQUFHWCxxQkFBcUIsU0FBUyxDQUFDLE9BQU9BLHFCQUFxQixVQUFVLE9BQU87WUFDL0VZLEdBQUdaLHFCQUFxQixPQUFPLENBQUMsT0FBTztZQUN2Q2MsU0FBUztZQUNUQyxZQUFZO2dCQUNWQyxNQUFNO2dCQUNOQyxXQUFXO2dCQUNYQyxTQUFTO2dCQUNURyxVQUFVO1lBQ1o7UUFDRjtJQUNGO0lBRUEsNEVBQTRFO0lBQzVFLElBQUksQ0FBQ2pCLFdBQVcsQ0FBQ1QsV0FBVyxDQUFDQSxRQUFRMkIsRUFBRSxJQUFJLENBQUMzQixRQUFRNEIsS0FBSyxFQUFFO1FBQ3pELHFCQUNFLDhEQUFDQztZQUFJQyxXQUFVO1lBQTBEQyxPQUFPO2dCQUFFQyxXQUFXO1lBQVE7c0JBQ25HLDRFQUFDSDtnQkFBSUMsV0FBVTs7a0NBQ2IsOERBQUNEO3dCQUFJQyxXQUFVOzs7Ozs7a0NBQ2YsOERBQUNEO3dCQUFJQyxXQUFVOzs7Ozs7a0NBQ2YsOERBQUNEO3dCQUFJQyxXQUFVOzs7Ozs7a0NBQ2YsOERBQUNEO3dCQUFJQyxXQUFVOzs7Ozs7a0NBQ2YsOERBQUNEO3dCQUFJQyxXQUFVOzswQ0FDYiw4REFBQ0Q7Z0NBQUlDLFdBQVU7Ozs7OzswQ0FDZiw4REFBQ0Q7Z0NBQUlDLFdBQVU7Ozs7OzswQ0FDZiw4REFBQ0Q7Z0NBQUlDLFdBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBS3pCO0lBRUEscUJBQ0UsOERBQUNoQyxpREFBTUEsQ0FBQytCLEdBQUc7UUFFVEMsV0FBVTtRQUNWQyxPQUFPO1lBQUVDLFdBQVc7WUFBU0MsU0FBUztZQUFRQyxlQUFlO1FBQVM7UUFDdEVDLFVBQVVyQjtRQUNWQyxTQUFRO1FBQ1JxQixTQUFTN0I7a0JBRVQsNEVBQUNzQjtZQUFJQyxXQUFVOzs4QkFFYiw4REFBQ087b0JBQUdQLFdBQVU7OEJBQXlDOUIsUUFBUTRCLEtBQUs7Ozs7Ozs4QkFHcEUsOERBQUNVO29CQUFFUixXQUFVOzhCQUNWOUIsUUFBUXVDLE9BQU8sR0FBRyxHQUF3QnZDLE9BQXJCQSxRQUFRdUMsT0FBTyxFQUFDLE9BQThCLE9BQXpCdkMsUUFBUXdDLFVBQVUsSUFBSSxNQUFPOzs7Ozs7OEJBSTFFLDhEQUFDWDtvQkFBSUMsV0FBVTs7c0NBQ2IsOERBQUNXOzRCQUFHWCxXQUFVO3NDQUFnRDs7Ozs7O3NDQUM5RCw4REFBQ1E7NEJBQUVSLFdBQVU7c0NBQ1Y5QixRQUFRMEMsV0FBVyxJQUFJOzs7Ozs7c0NBRzFCLDhEQUFDRDs0QkFBR1gsV0FBVTtzQ0FBZ0Q7Ozs7OztzQ0FDOUQsOERBQUNROzRCQUFFUixXQUFVO3NDQUNWOUIsUUFBUTBCLFFBQVEsSUFBSTs7Ozs7O3NDQUd2Qiw4REFBQ2U7NEJBQUdYLFdBQVU7c0NBQWdEOzs7Ozs7c0NBQzlELDhEQUFDUTs0QkFBRVIsV0FBVTtzQ0FDVjlCLFFBQVEyQyxVQUFVLElBQUk7Ozs7OztzQ0FHekIsOERBQUNGOzRCQUFHWCxXQUFVO3NDQUFnRDs7Ozs7O3NDQUM5RCw4REFBQ0Q7NEJBQUlDLFdBQVU7c0NBQ1o5QixRQUFRNEMsTUFBTSxJQUFJNUMsUUFBUTRDLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLElBQ3pDN0MsUUFBUTRDLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDLENBQUNDLE9BQU9DLHNCQUN6Qiw4REFBQ0M7b0NBRUNuQixXQUFVOzhDQUVUaUI7bUNBSEksU0FBa0JBLE9BQVRDLE9BQU0sS0FBUyxPQUFORDs7OzsrREFPM0IsOERBQUNFO2dDQUFLbkIsV0FBVTswQ0FBdUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BN0MxQyxlQUEwQixPQUFYOUIsUUFBUTJCLEVBQUU7Ozs7O0FBb0RwQztHQWpKTTVCO0tBQUFBO0FBbUpOLGlFQUFlQSxXQUFXQSxFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvYWxleGhzdS9EZXNrdG9wL2ZydWl0Ym95L2ZydWl0aW9uL2Zyb250ZW5kL3NyYy9jb21wb25lbnRzL2Nvbm5lY3QvUHJvamVjdENhcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnQC90eXBlcy9wcm9qZWN0JztcbmltcG9ydCB7IG1vdGlvbiB9IGZyb20gJ2ZyYW1lci1tb3Rpb24nO1xuXG5pbnRlcmZhY2UgUHJvamVjdENhcmRQcm9wcyB7XG4gIHByb2plY3Q6IFByb2plY3Q7XG4gIG9uRGVjbGluZTogKCkgPT4gdm9pZDtcbiAgb25TYXZlOiAoKSA9PiB2b2lkO1xuICBvbkFwcGx5OiAoKSA9PiB2b2lkO1xuICBzd2lwZURpcmVjdGlvbjogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICd1cCcgfCBudWxsO1xufVxuXG5jb25zdCBQcm9qZWN0Q2FyZCA9ICh7IHByb2plY3QsIHN3aXBlRGlyZWN0aW9uLCBvbkRlY2xpbmUsIG9uU2F2ZSwgb25BcHBseSB9OiBQcm9qZWN0Q2FyZFByb3BzKSA9PiB7XG4gIGNvbnN0IFthbmltYXRlRGlyZWN0aW9uLCBzZXRBbmltYXRlRGlyZWN0aW9uXSA9IHVzZVN0YXRlPCdsZWZ0JyB8ICdyaWdodCcgfCAndXAnIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFthbmltYXRpb25QaGFzZSwgc2V0QW5pbWF0aW9uUGhhc2VdID0gdXNlU3RhdGU8J2luaXRpYWwnIHwgJ2JvdW5jZScgfCAnZXhpdCc+KCdpbml0aWFsJyk7XG4gIGNvbnN0IFttb3VudGVkLCBzZXRNb3VudGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgXG4gIC8vIFNldCBtb3VudGVkIHN0YXRlIG9uIGNsaWVudCBzaWRlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0TW91bnRlZCh0cnVlKTtcbiAgfSwgW10pO1xuICBcbiAgLy8gUmVzZXQgYW5pbWF0aW9uIHdoZW4gcHJvamVjdCBjaGFuZ2VzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0KSByZXR1cm47XG4gICAgc2V0QW5pbWF0ZURpcmVjdGlvbihudWxsKTtcbiAgICBzZXRBbmltYXRpb25QaGFzZSgnaW5pdGlhbCcpO1xuICB9LCBbcHJvamVjdF0pO1xuICBcbiAgLy8gSGFuZGxlIGFuaW1hdGlvbiBiYXNlZCBvbiBzd2lwZSBkaXJlY3Rpb25cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN3aXBlRGlyZWN0aW9uIHx8ICFtb3VudGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHNldEFuaW1hdGVEaXJlY3Rpb24oc3dpcGVEaXJlY3Rpb24pO1xuICAgIHNldEFuaW1hdGlvblBoYXNlKCdib3VuY2UnKTtcbiAgICBcbiAgICAvLyBGaXJzdCBwaGFzZTogYm91bmNlIGluIGRpcmVjdGlvbiAtIHJlZHVjZWQgZnJvbSAzMDBtcyB0byAyMDBtc1xuICAgIGNvbnN0IGJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBGb3IgYWxsIGFjdGlvbnMgKGxlZnQsIHJpZ2h0LCB1cCksIHdlIGV4aXQgYWZ0ZXIgYm91bmNlXG4gICAgICBzZXRBbmltYXRpb25QaGFzZSgnZXhpdCcpO1xuICAgIH0sIDIwMCk7XG4gICAgXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dChib3VuY2VUaW1lcik7XG4gIH0sIFtzd2lwZURpcmVjdGlvbiwgbW91bnRlZF0pO1xuICBcbiAgLy8gVmFyaWFudHMgZm9yIGNhcmQgYW5pbWF0aW9uc1xuICBjb25zdCBjYXJkVmFyaWFudHMgPSB7XG4gICAgaW5pdGlhbDoge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBzY2FsZTogMSxcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdzcHJpbmcnLFxuICAgICAgICBzdGlmZm5lc3M6IDQwMCxcbiAgICAgICAgZGFtcGluZzogMjVcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdW5jZToge1xuICAgICAgeDogYW5pbWF0ZURpcmVjdGlvbiA9PT0gJ2xlZnQnID8gLTQwIDogYW5pbWF0ZURpcmVjdGlvbiA9PT0gJ3JpZ2h0JyA/IDQwIDogMCxcbiAgICAgIHk6IGFuaW1hdGVEaXJlY3Rpb24gPT09ICd1cCcgPyAtNDAgOiAwLFxuICAgICAgc2NhbGU6IDEuMDMsXG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNpdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3ByaW5nJyxcbiAgICAgICAgc3RpZmZuZXNzOiA1MDAsXG4gICAgICAgIGRhbXBpbmc6IDIwXG4gICAgICB9XG4gICAgfSxcbiAgICBleGl0OiB7XG4gICAgICB4OiBhbmltYXRlRGlyZWN0aW9uID09PSAnbGVmdCcgPyAtMTAwMCA6IGFuaW1hdGVEaXJlY3Rpb24gPT09ICdyaWdodCcgPyAxMDAwIDogMCxcbiAgICAgIHk6IGFuaW1hdGVEaXJlY3Rpb24gPT09ICd1cCcgPyAtMTAwMCA6IDAsXG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgdHJhbnNpdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3ByaW5nJyxcbiAgICAgICAgc3RpZmZuZXNzOiA0MDAsXG4gICAgICAgIGRhbXBpbmc6IDI1LFxuICAgICAgICBkdXJhdGlvbjogMC4yXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBcbiAgLy8gSWYgbm90IG1vdW50ZWQgeWV0IG9yIHByb2plY3QgZGF0YSBpcyBtaXNzaW5nLCBzaG93IGEgbG9hZGluZyBwbGFjZWhvbGRlclxuICBpZiAoIW1vdW50ZWQgfHwgIXByb2plY3QgfHwgIXByb2plY3QuaWQgfHwgIXByb2plY3QudGl0bGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLXhsIHNoYWRvdy1sZyBwLTggdy1mdWxsIG1heC13LTV4bCBtYi04XCIgc3R5bGU9e3sgbWluSGVpZ2h0OiAnNTAwcHgnIH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFuaW1hdGUtcHVsc2VcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtMTAgYmctZ3JheS0yMDAgcm91bmRlZCB3LTMvNCBtYi00XCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTYgYmctZ3JheS0yMDAgcm91bmRlZCB3LTEvMiBtYi04XCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTQwIGJnLWdyYXktMjAwIHJvdW5kZWQgbWItOFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC04IGJnLWdyYXktMjAwIHJvdW5kZWQgdy0xLzQgbWItNFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAgZ2FwLTMgbWItOFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTEwIGJnLWdyYXktMjAwIHJvdW5kZWQtZnVsbCB3LTI4XCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtMTAgYmctZ3JheS0yMDAgcm91bmRlZC1mdWxsIHctMzZcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC0xMCBiZy1ncmF5LTIwMCByb3VuZGVkLWZ1bGwgdy0zMlwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxtb3Rpb24uZGl2XG4gICAgICBrZXk9e2BjYXJkLW1vdGlvbi0ke3Byb2plY3QuaWR9YH1cbiAgICAgIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy1tZCBib3JkZXIgYm9yZGVyLXNvbGlkIGJvcmRlci1uZXV0cmFsLTIwMCBwLTggdy1mdWxsIG1heC13LVs5MCVdIG14LWF1dG8gbWItOFwiXG4gICAgICBzdHlsZT17eyBtaW5IZWlnaHQ6ICc3NTBweCcsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfX1cbiAgICAgIHZhcmlhbnRzPXtjYXJkVmFyaWFudHN9XG4gICAgICBpbml0aWFsPVwiaW5pdGlhbFwiXG4gICAgICBhbmltYXRlPXthbmltYXRpb25QaGFzZX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtZ3Jvd1wiPlxuICAgICAgICB7LyogUHJvamVjdCB0aXRsZSAqL31cbiAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktODAwIG1iLTJcIj57cHJvamVjdC50aXRsZX08L2gyPlxuICAgICAgICBcbiAgICAgICAgey8qIFByb2plY3Qgb3JnYW5pemF0aW9uICovfVxuICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhsIHRleHQtdmlvbGV0LTYwMCBmb250LW1lZGl1bSBtYi02XCI+XG4gICAgICAgICAge3Byb2plY3QuZmFjdWx0eSA/IGAke3Byb2plY3QuZmFjdWx0eX0g4oCiICR7cHJvamVjdC5kZXBhcnRtZW50IHx8ICcnfWAgOiAnUmVzZWFyY2ggT3JnYW5pemF0aW9uJ31cbiAgICAgICAgPC9wPlxuICAgICAgICBcbiAgICAgICAgey8qIFByb2plY3QgZGVzY3JpcHRpb24gKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItOFwiPlxuICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTcwMCBtdC02IG1iLTNcIj5Qcm9qZWN0IERlc2NyaXB0aW9uPC9oMz5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktNjAwIHRleHQtbGcgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICB7cHJvamVjdC5kZXNjcmlwdGlvbiB8fCAnTm8gZGVzY3JpcHRpb24gcHJvdmlkZWQuJ31cbiAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS03MDAgbXQtNiBtYi0zXCI+RHVyYXRpb246PC9oMz5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktNjAwIHRleHQtbGcgbGVhZGluZy1yZWxheGVkIG1iLTRcIj5cbiAgICAgICAgICAgIHtwcm9qZWN0LmR1cmF0aW9uIHx8ICdEdXJhdGlvbiBub3Qgc3BlY2lmaWVkLid9XG4gICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQteGwgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktNzAwIG10LTYgbWItM1wiPkNvbW1pdG1lbnQ6PC9oMz5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktNjAwIHRleHQtbGcgbGVhZGluZy1yZWxheGVkIG1iLTRcIj5cbiAgICAgICAgICAgIHtwcm9qZWN0LmNvbW1pdG1lbnQgfHwgJ0NvbW1pdG1lbnQgbm90IHNwZWNpZmllZC4nfVxuICAgICAgICAgIDwvcD5cblxuICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTcwMCBtdC02IG1iLTNcIj5Ta2lsbHM6PC9oMz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGdhcC0zXCI+XG4gICAgICAgICAgICB7cHJvamVjdC5za2lsbHMgJiYgcHJvamVjdC5za2lsbHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgcHJvamVjdC5za2lsbHMubWFwKChza2lsbCwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8c3BhbiBcbiAgICAgICAgICAgICAgICAgIGtleT17YHNraWxsLSR7aW5kZXh9LSR7c2tpbGx9YH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLXZpb2xldC0xMDAgdGV4dC12aW9sZXQtODAwIHB4LTQgcHktMiByb3VuZGVkLWZ1bGwgdGV4dC1sZyBmb250LW1lZGl1bVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3NraWxsfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZ3JheS01MDAgaXRhbGljXCI+Tm8gc3BlY2lmaWMgc2tpbGxzIGxpc3RlZDwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9tb3Rpb24uZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUHJvamVjdENhcmQ7Il0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwibW90aW9uIiwiUHJvamVjdENhcmQiLCJwcm9qZWN0Iiwic3dpcGVEaXJlY3Rpb24iLCJvbkRlY2xpbmUiLCJvblNhdmUiLCJvbkFwcGx5IiwiYW5pbWF0ZURpcmVjdGlvbiIsInNldEFuaW1hdGVEaXJlY3Rpb24iLCJhbmltYXRpb25QaGFzZSIsInNldEFuaW1hdGlvblBoYXNlIiwibW91bnRlZCIsInNldE1vdW50ZWQiLCJib3VuY2VUaW1lciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJjYXJkVmFyaWFudHMiLCJpbml0aWFsIiwieCIsInkiLCJzY2FsZSIsIm9wYWNpdHkiLCJ0cmFuc2l0aW9uIiwidHlwZSIsInN0aWZmbmVzcyIsImRhbXBpbmciLCJib3VuY2UiLCJleGl0IiwiZHVyYXRpb24iLCJpZCIsInRpdGxlIiwiZGl2IiwiY2xhc3NOYW1lIiwic3R5bGUiLCJtaW5IZWlnaHQiLCJkaXNwbGF5IiwiZmxleERpcmVjdGlvbiIsInZhcmlhbnRzIiwiYW5pbWF0ZSIsImgyIiwicCIsImZhY3VsdHkiLCJkZXBhcnRtZW50IiwiaDMiLCJkZXNjcmlwdGlvbiIsImNvbW1pdG1lbnQiLCJza2lsbHMiLCJsZW5ndGgiLCJtYXAiLCJza2lsbCIsImluZGV4Iiwic3BhbiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/connect/ProjectCard.tsx\n"));

/***/ })

});