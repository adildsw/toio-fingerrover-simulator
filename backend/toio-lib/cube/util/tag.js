"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagHandler = void 0;
var createTagHandler = function () {
    var tag = 0;
    return {
        current: function () {
            return tag;
        },
        next: function () {
            tag = (tag + 1) % 256;
            return tag;
        },
    };
};
exports.createTagHandler = createTagHandler;
//# sourceMappingURL=tag.js.map