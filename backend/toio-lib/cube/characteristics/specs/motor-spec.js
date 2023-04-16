"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotorSpec = void 0;
var clamp_1 = require("../../util/clamp");
var tag_1 = require("../../util/tag");
var MotorSpec = (function () {
    function MotorSpec(tag) {
        if (tag === void 0) { tag = (0, tag_1.createTagHandler)(); }
        this.tag = tag;
    }
    MotorSpec.prototype.parse = function (buffer) {
        if (buffer.byteLength !== 3) {
            throw new Error('parse error');
        }
        var type = buffer.readUInt8(0);
        switch (type) {
            case 0x83:
            case 0x84:
                return {
                    buffer: buffer,
                    data: {
                        operationId: buffer.readUInt8(1),
                        reason: buffer.readUInt8(2),
                    },
                    dataType: 'motor:moveTo-response',
                };
            case 0xe0:
                return {
                    buffer: buffer,
                    data: {
                        left: buffer.readUInt8(1),
                        right: buffer.readUInt8(2),
                    },
                    dataType: 'motor:speed-feedback',
                };
        }
        throw new Error('parse error');
    };
    MotorSpec.prototype.move = function (left, right, durationMs) {
        if (durationMs === void 0) { durationMs = 0; }
        var lSign = left > 0 ? 1 : -1;
        var rSign = right > 0 ? 1 : -1;
        var lDirection = left > 0 ? 1 : 2;
        var rDirection = right > 0 ? 1 : 2;
        var lPower = Math.min(Math.abs(left), MotorSpec.MAX_SPEED);
        var rPower = Math.min(Math.abs(right), MotorSpec.MAX_SPEED);
        var duration = (0, clamp_1.clamp)(durationMs / 10, 0, 255);
        return {
            buffer: Buffer.from([2, 1, lDirection, lPower, 2, rDirection, rPower, duration]),
            data: {
                left: lSign * lPower,
                right: rSign * rPower,
                durationMs: duration * 10,
            },
        };
    };
    MotorSpec.prototype.moveTo = function (targets, options) {
        var _a, _b, _c, _d;
        var operationId = this.tag.next();
        var numTargets = Math.min(targets.length, MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION);
        var buffer = Buffer.alloc(8 + 6 * numTargets);
        buffer.writeUInt8(4, 0);
        buffer.writeUInt8(operationId, 1);
        buffer.writeUInt8(options.timeout, 2);
        buffer.writeUInt8(options.moveType, 3);
        buffer.writeUInt8(options.maxSpeed, 4);
        buffer.writeUInt8(options.speedType, 5);
        buffer.writeUInt8(0, 6);
        buffer.writeUInt8(options.overwrite ? 0 : 1, 7);
        for (var i = 0; i < numTargets; i++) {
            var target = targets[i];
            var x = (_a = target.x) !== null && _a !== void 0 ? _a : 0xffff;
            var y = (_b = target.y) !== null && _b !== void 0 ? _b : 0xffff;
            var angle = (0, clamp_1.clamp)((_c = target.angle) !== null && _c !== void 0 ? _c : 0, 0, 0x1fff);
            var rotateType = (_d = target.rotateType) !== null && _d !== void 0 ? _d : 0x00;
            if (target.angle === undefined && target.rotateType !== 0x06) {
                rotateType = 0x05;
            }
            buffer.writeUInt16LE(x, 8 + 6 * i);
            buffer.writeUInt16LE(y, 10 + 6 * i);
            buffer.writeUInt16LE((rotateType << 13) | angle, 12 + 6 * i);
        }
        return {
            buffer: Buffer.from(buffer),
            data: {
                targets: targets.slice(0, numTargets),
                options: __assign(__assign({}, options), { operationId: operationId }),
            },
        };
    };
    MotorSpec.prototype.accelerationMove = function (translationSpeed, rotationSpeed, acceleration, priorityType, durationMs) {
        if (acceleration === void 0) { acceleration = 0; }
        if (priorityType === void 0) { priorityType = MotorSpec.ACC_PRIORITY_STRAIGHT; }
        if (durationMs === void 0) { durationMs = 0; }
        var tSign = translationSpeed > 0 ? 1 : -1;
        var rSign = rotationSpeed > 0 ? 1 : -1;
        var tDirection = translationSpeed > 0 ? 0 : 1;
        var rDirection = rotationSpeed > 0 ? 0 : 1;
        var sPower = Math.min(Math.abs(translationSpeed), MotorSpec.MAX_SPEED);
        var rPower = Math.min(Math.abs(rotationSpeed), MotorSpec.MAX_ROTATION);
        var rPowerLo = rPower & 0x00ff;
        var rPowerHi = (rPower & 0xff00) >> 8;
        var acc = Math.min(Math.abs(acceleration), 0xff);
        var duration = (0, clamp_1.clamp)(durationMs / 10, 0, 0xff);
        var pri = priorityType == MotorSpec.ACC_PRIORITY_STRAIGHT ? 0 : 1;
        return {
            buffer: Buffer.from([5, sPower, acc, rPowerLo, rPowerHi, rDirection, tDirection, pri, duration]),
            data: {
                straightSpeed: tSign * sPower,
                rotationSpeed: rSign * rPower,
                acceleration: acc,
                priorityType: pri,
                durationMs: duration * 10,
            },
        };
    };
    MotorSpec.MAX_SPEED = 115;
    MotorSpec.MAX_ROTATION = 0x7fff;
    MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION = 29;
    MotorSpec.ACC_PRIORITY_STRAIGHT = 0;
    MotorSpec.ACC_PRIORITY_ROTATION = 1;
    return MotorSpec;
}());
exports.MotorSpec = MotorSpec;
//# sourceMappingURL=motor-spec.js.map