"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToBlacklist = addToBlacklist;
exports.isBlacklisted = isBlacklisted;
const blacklist = new Set();
function addToBlacklist(token) {
    blacklist.add(token);
}
function isBlacklisted(token) {
    return blacklist.has(token);
}
