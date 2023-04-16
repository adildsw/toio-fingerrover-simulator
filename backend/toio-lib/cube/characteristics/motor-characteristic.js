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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotorCharacteristic = void 0;
var semver_1 = __importDefault(require("semver"));
var motor_spec_1 = require("./specs/motor-spec");
var MotorCharacteristic = (function () {
    function MotorCharacteristic(characteristic, eventEmitter) {
        this.spec = new motor_spec_1.MotorSpec();
        this.timer = null;
        this.pendingResolve = null;
        this.characteristic = characteristic;
        if (this.characteristic.properties.includes('notify')) {
            this.characteristic.on('data', this.onData.bind(this));
            this.characteristic.subscribe();
        }
        this.eventEmitter = eventEmitter;
    }
    MotorCharacteristic.prototype.init = function (bleProtocolVersion) {
        this.bleProtocolVersion = bleProtocolVersion;
    };
    MotorCharacteristic.prototype.move = function (left, right, durationMs) {
        var _this = this;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var data = this.spec.move(left, right, durationMs);
        this.characteristic.write(Buffer.from(data.buffer), true);
        if (data.data.durationMs > 0) {
            return new Promise(function (resolve) {
                _this.pendingResolve = resolve;
                _this.timer = setTimeout(function () {
                    if (_this.pendingResolve) {
                        _this.pendingResolve();
                        _this.pendingResolve = null;
                    }
                }, data.data.durationMs);
            });
        }
    };
    MotorCharacteristic.prototype.moveTo = function (targets, options) {
        var _this = this;
        if (this.bleProtocolVersion !== undefined && semver_1.default.lt(this.bleProtocolVersion, '2.1.0')) {
            return Promise.resolve();
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var createPendingPromise = function (targets, options) { return function () {
            return new Promise(function (resolve, reject) {
                var ret = _this.spec.moveTo(targets, options);
                var handleResponse = function (data) {
                    if (data.operationId === ret.data.options.operationId) {
                        _this.eventEmitter.removeListener('motor:moveTo-response', handleResponse);
                        if (data.reason === 0 || data.reason === 5) {
                            resolve();
                        }
                        else {
                            reject(data.reason);
                        }
                    }
                };
                _this.characteristic.write(Buffer.from(ret.buffer), true);
                _this.eventEmitter.on('motor:moveTo-response', handleResponse);
            });
        }; };
        var promises = targets.reduce(function (acc, _target, index) {
            if (index % motor_spec_1.MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION === 0) {
                var which = (index / motor_spec_1.MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION) % 2;
                acc[which] = acc[which].then(createPendingPromise(targets.slice(index, index + motor_spec_1.MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION), index === 0
                    ? options
                    : __assign(__assign({}, options), { overwrite: false })));
            }
            return acc;
        }, [Promise.resolve(), Promise.resolve()]);
        return new Promise(function (resolve, reject) {
            Promise.all(promises)
                .then(function () {
                resolve();
            })
                .catch(reject);
        });
    };
    MotorCharacteristic.prototype.accelerationMove = function (translationSpeed, rotationSpeed, acceleration, priorityType, durationMs) {
        var _this = this;
        if (this.bleProtocolVersion !== undefined && semver_1.default.lt(this.bleProtocolVersion, '2.1.0')) {
            return Promise.resolve();
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var data = this.spec.accelerationMove(translationSpeed, rotationSpeed, acceleration, priorityType, durationMs);
        this.characteristic.write(Buffer.from(data.buffer), true);
        if (data.data.durationMs > 0) {
            return new Promise(function (resolve) {
                _this.pendingResolve = resolve;
                _this.timer = setTimeout(function () {
                    if (_this.pendingResolve) {
                        _this.pendingResolve();
                        _this.pendingResolve = null;
                    }
                }, data.data.durationMs);
            });
        }
    };
    MotorCharacteristic.prototype.stop = function () {
        this.move(0, 0, 0);
    };
    MotorCharacteristic.prototype.onData = function (data) {
        try {
            var ret = this.spec.parse(data);
            if (ret.dataType === 'motor:moveTo-response') {
                this.eventEmitter.emit('motor:moveTo-response', { operationId: ret.data.operationId, reason: ret.data.reason });
            }
            if (ret.dataType === 'motor:speed-feedback') {
                this.eventEmitter.emit('motor:speed-feedback', { left: ret.data.left, right: ret.data.right });
            }
        }
        catch (e) {
            return;
        }
    };
    MotorCharacteristic.UUID = '10b201025b3b45719508cf3efcd7bbae';
    return MotorCharacteristic;
}());
exports.MotorCharacteristic = MotorCharacteristic;
//# sourceMappingURL=motor-characteristic.js.map