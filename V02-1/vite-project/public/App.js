"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _React = _interopRequireDefault(require("./core/React.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function Counter() {
  return /*#__PURE__*/_React["default"].createElement("div", null, "Counter");
}
function App() {
  return /*#__PURE__*/_React["default"].createElement("div", null, /*#__PURE__*/_React["default"].createElement("div", null, "mini-react"), /*#__PURE__*/_React["default"].createElement(Counter, null));
}
var _default = exports["default"] = App;