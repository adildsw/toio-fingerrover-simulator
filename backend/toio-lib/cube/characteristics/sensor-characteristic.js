"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorCharacteristic = void 0;
var sensor_spec_1 = require("./specs/sensor-spec");
var SensorCharacteristic = (function () {
    function SensorCharacteristic(characteristic, eventEmitter) {
        this.spec = new sensor_spec_1.SensorSpec();
        this.magnetMode = 0;
        this.prevMotionStatus = {};
        this.prevMagnetStatus = {};
        this.prevAttitudeEuler = {};
        this.prevAttitudeQuaternion = {};
        this.characteristic = characteristic;
        if (this.characteristic.properties.includes('notify')) {
            this.characteristic.on('data', this.onData.bind(this));
            this.characteristic.subscribe();
        }
        this.eventEmitter = eventEmitter;
    }
    SensorCharacteristic.prototype.getSlopeStatus = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMotionStatus.isSloped !== undefined
                ? resolve({ isSloped: _this.prevMotionStatus.isSloped })
                : resolve({ isSloped: false });
        });
    };
    SensorCharacteristic.prototype.getCollisionStatus = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMotionStatus.isCollisionDetected !== undefined
                ? resolve({ isCollisionDetected: _this.prevMotionStatus.isCollisionDetected })
                : resolve({ isCollisionDetected: false });
        });
    };
    SensorCharacteristic.prototype.getDoubleTapStatus = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMotionStatus.isDoubleTapped !== undefined
                ? resolve({ isDoubleTapped: _this.prevMotionStatus.isDoubleTapped })
                : resolve({ isDoubleTapped: false });
        });
    };
    SensorCharacteristic.prototype.getOrientation = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMotionStatus.orientation !== undefined
                ? resolve({ orientation: _this.prevMotionStatus.orientation })
                : resolve({ orientation: 1 });
        });
    };
    SensorCharacteristic.prototype.getMagnetId = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMagnetStatus.id !== undefined ? resolve({ id: _this.prevMagnetStatus.id }) : resolve({ id: 0 });
        });
    };
    SensorCharacteristic.prototype.getMagnetForce = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevMagnetStatus.force !== undefined &&
                _this.prevMagnetStatus.directionX !== undefined &&
                _this.prevMagnetStatus.directionY !== undefined &&
                _this.prevMagnetStatus.directionZ !== undefined
                ? resolve({
                    force: _this.prevMagnetStatus.force,
                    directionX: _this.prevMagnetStatus.directionX,
                    directionY: _this.prevMagnetStatus.directionY,
                    directionZ: _this.prevMagnetStatus.directionZ,
                })
                : resolve({ force: 0, directionX: 0, directionY: 0, directionZ: 0 });
        });
    };
    SensorCharacteristic.prototype.getAttitudeEuler = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevAttitudeEuler.roll !== undefined &&
                _this.prevAttitudeEuler.pitch !== undefined &&
                _this.prevAttitudeEuler.yaw !== undefined
                ? resolve({
                    roll: _this.prevAttitudeEuler.roll,
                    pitch: _this.prevAttitudeEuler.pitch,
                    yaw: _this.prevAttitudeEuler.yaw,
                })
                : resolve({
                    roll: 0,
                    pitch: 0,
                    yaw: 0,
                });
        });
    };
    SensorCharacteristic.prototype.getAttitudeQuaternion = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.prevAttitudeQuaternion.w !== undefined &&
                _this.prevAttitudeQuaternion.x !== undefined &&
                _this.prevAttitudeQuaternion.y !== undefined &&
                _this.prevAttitudeQuaternion.z !== undefined
                ? resolve({
                    w: _this.prevAttitudeQuaternion.w,
                    x: _this.prevAttitudeQuaternion.x,
                    y: _this.prevAttitudeQuaternion.y,
                    z: _this.prevAttitudeQuaternion.z,
                })
                : resolve({
                    w: 1,
                    x: 0,
                    y: 0,
                    z: 0,
                });
        });
    };
    SensorCharacteristic.prototype.notifyMotionStatus = function () {
        this.characteristic.write(Buffer.from([0x81]), false);
    };
    SensorCharacteristic.prototype.notifyMagnetStatus = function () {
        this.characteristic.write(Buffer.from([0x82]), false);
    };
    SensorCharacteristic.prototype.setMagnetMode = function (mode) {
        this.magnetMode = mode;
    };
    SensorCharacteristic.prototype.onData = function (data) {
        try {
            var parsedData = this.spec.parse(data);
            if (parsedData.dataType === 'sensor:motion') {
                if (this.prevMotionStatus.isSloped !== parsedData.data.isSloped) {
                    this.eventEmitter.emit('sensor:slope', { isSloped: parsedData.data.isSloped });
                }
                if (parsedData.data.isCollisionDetected) {
                    this.eventEmitter.emit('sensor:collision', { isCollisionDetected: parsedData.data.isCollisionDetected });
                }
                if (parsedData.data.isDoubleTapped) {
                    this.eventEmitter.emit('sensor:double-tap');
                }
                if (this.prevMotionStatus.orientation !== parsedData.data.orientation) {
                    this.eventEmitter.emit('sensor:orientation', { orientation: parsedData.data.orientation });
                }
                if (this.prevMotionStatus.shakeLevel !== parsedData.data.shakeLevel) {
                    this.eventEmitter.emit('sensor:shake', { level: parsedData.data.shakeLevel });
                }
                this.prevMotionStatus = parsedData.data;
            }
            if (parsedData.dataType === 'sensor:magnet') {
                if (this.magnetMode === 1) {
                    this.eventEmitter.emit('sensor:magnet-id', { id: parsedData.data.id });
                }
                if (this.magnetMode === 2) {
                    this.eventEmitter.emit('sensor:magnet-force', {
                        force: parsedData.data.force,
                        directionX: parsedData.data.directionX,
                        directionY: parsedData.data.directionY,
                        directionZ: parsedData.data.directionZ,
                    });
                }
                this.prevMagnetStatus = parsedData.data;
            }
            if (parsedData.dataType === 'sensor:attitude-euler') {
                this.eventEmitter.emit('sensor:attitude-euler', {
                    roll: parsedData.data.roll,
                    pitch: parsedData.data.pitch,
                    yaw: parsedData.data.yaw,
                });
                this.prevAttitudeEuler = parsedData.data;
            }
            if (parsedData.dataType === 'sensor:attitude-quaternion') {
                this.eventEmitter.emit('sensor:attitude-quaternion', {
                    w: parsedData.data.w,
                    x: parsedData.data.x,
                    y: parsedData.data.y,
                    z: parsedData.data.z,
                });
                this.prevAttitudeQuaternion = parsedData.data;
            }
        }
        catch (e) {
            return;
        }
    };
    SensorCharacteristic.UUID = '10b201065b3b45719508cf3efcd7bbae';
    return SensorCharacteristic;
}());
exports.SensorCharacteristic = SensorCharacteristic;
//# sourceMappingURL=sensor-characteristic.js.map