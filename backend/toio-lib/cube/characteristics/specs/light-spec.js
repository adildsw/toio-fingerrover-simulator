"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightSpec = void 0;
var clamp_1 = require("../../util/clamp");
var LightSpec = (function () {
    function LightSpec() {
    }
    LightSpec.prototype.turnOnLight = function (operation) {
        var duration = (0, clamp_1.clamp)(operation.durationMs / 10, 0, 255);
        var red = (0, clamp_1.clamp)(operation.red, 0, 255);
        var green = (0, clamp_1.clamp)(operation.green, 0, 255);
        var blue = (0, clamp_1.clamp)(operation.blue, 0, 255);
        return {
            buffer: Buffer.from([3, duration, 1, 1, red, green, blue]),
            data: {
                durationMs: duration * 10,
                red: red,
                green: green,
                blue: blue,
            },
        };
    };
    LightSpec.prototype.turnOnLightWithScenario = function (operations, repeatCount) {
        var arrangedData = {
            operations: [],
            repeatCount: (0, clamp_1.clamp)(repeatCount, 0, 255),
            totalDurationMs: 0,
        };
        var numOperations = Math.min(operations.length, 29);
        var buffer = Buffer.alloc(3 + 6 * numOperations);
        buffer.writeUInt8(4, 0);
        buffer.writeUInt8(arrangedData.repeatCount, 1);
        buffer.writeUInt8(numOperations, 2);
        var totalDurationMs = 0;
        for (var i = 0; i < numOperations; i++) {
            var operation = operations[i];
            var duration = (0, clamp_1.clamp)(operation.durationMs / 10, 1, 255);
            var red = (0, clamp_1.clamp)(operation.red, 0, 255);
            var green = (0, clamp_1.clamp)(operation.green, 0, 255);
            var blue = (0, clamp_1.clamp)(operation.blue, 0, 255);
            totalDurationMs += duration;
            arrangedData.operations.push({
                durationMs: duration * 10,
                red: red,
                green: green,
                blue: blue,
            });
            buffer.writeUInt8(duration, 3 + 6 * i);
            buffer.writeUInt8(1, 4 + 6 * i);
            buffer.writeUInt8(1, 5 + 6 * i);
            buffer.writeUInt8(red, 6 + 6 * i);
            buffer.writeUInt8(green, 7 + 6 * i);
            buffer.writeUInt8(blue, 8 + 6 * i);
        }
        arrangedData.totalDurationMs = totalDurationMs * 10 * arrangedData.repeatCount;
        return {
            buffer: buffer,
            data: arrangedData,
        };
    };
    LightSpec.prototype.turnOffLight = function () {
        return {
            buffer: Buffer.from([1]),
        };
    };
    return LightSpec;
}());
exports.LightSpec = LightSpec;
//# sourceMappingURL=light-spec.js.map