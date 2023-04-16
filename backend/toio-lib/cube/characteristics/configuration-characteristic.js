"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationCharacteristic = void 0;
var clamp_1 = require("../util/clamp");
var events_1 = require("events");
var ConfigurationCharacteristic = (function () {
    function ConfigurationCharacteristic(characteristic) {
        this.eventEmitter = new events_1.EventEmitter();
        this.characteristic = characteristic;
        if (this.characteristic.properties.includes('notify')) {
            this.characteristic.on('data', this.onData.bind(this));
        }
    }
    ConfigurationCharacteristic.prototype.init = function (bleProtocolVersion) {
        this.bleProtocolVersion = bleProtocolVersion;
    };
    ConfigurationCharacteristic.prototype.getBLEProtocolVersion = function () {
        var _this = this;
        if (this.bleProtocolVersion !== undefined) {
            return Promise.resolve(this.bleProtocolVersion);
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.characteristic.subscribe(function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        _this.characteristic.write(Buffer.from([0x01, 0x00]), false);
                        _this.eventEmitter.once('configuration:ble-protocol-version', function (version) {
                            _this.characteristic.unsubscribe();
                            _this.bleProtocolVersion = version;
                            resolve(version);
                        });
                    }
                });
            });
        }
    };
    ConfigurationCharacteristic.prototype.setFlatThreshold = function (degree) {
        var deg = (0, clamp_1.clamp)(degree, 1, 45);
        this.characteristic.write(Buffer.from([0x05, 0x00, deg]), false);
    };
    ConfigurationCharacteristic.prototype.setCollisionThreshold = function (threshold) {
        var th = (0, clamp_1.clamp)(threshold, 1, 10);
        this.characteristic.write(Buffer.from([0x06, 0x00, th]), false);
    };
    ConfigurationCharacteristic.prototype.setDoubleTapIntervalThreshold = function (threshold) {
        var th = (0, clamp_1.clamp)(threshold, 0, 7);
        this.characteristic.write(Buffer.from([0x17, 0x00, th]), false);
    };
    ConfigurationCharacteristic.prototype.setIdNotification = function (intervalMs, notificationType) {
        var interval = (0, clamp_1.clamp)(intervalMs / 10, 0, 0xff);
        var type = (0, clamp_1.clamp)(notificationType, 0, 0xff);
        this.characteristic.write(Buffer.from([0x18, 0x00, interval, type]), false);
    };
    ConfigurationCharacteristic.prototype.setIdMissedNotification = function (sensitivityMs) {
        var sensitivity = (0, clamp_1.clamp)(sensitivityMs / 10, 0, 0xff);
        this.characteristic.write(Buffer.from([0x19, 0x00, sensitivity]), false);
    };
    ConfigurationCharacteristic.prototype.setMotorSpeedFeedback = function (enable) {
        var en = enable ? 1 : 0;
        this.characteristic.write(Buffer.from([0x1c, 0x00, en]), false);
    };
    ConfigurationCharacteristic.prototype.setMagnetDetection = function (detectType, intervalMs, notificationType) {
        var detect = (0, clamp_1.clamp)(detectType, 0, 2);
        var interval = (0, clamp_1.clamp)(intervalMs / 20, 1, 0xff);
        var notification = (0, clamp_1.clamp)(notificationType, 0, 1);
        this.characteristic.write(Buffer.from([0x1b, 0x00, detect, interval, notification]), false);
    };
    ConfigurationCharacteristic.prototype.setAttitudeControl = function (format, intervalMs, notificationType) {
        var fmt = (0, clamp_1.clamp)(format, 1, 2);
        var interval = (0, clamp_1.clamp)(intervalMs / 10, 0, 0xff);
        var type = (0, clamp_1.clamp)(notificationType, 0, 1);
        this.characteristic.write(Buffer.from([0x1d, 0x00, fmt, interval, type]), false);
    };
    ConfigurationCharacteristic.prototype.data2result = function (data) {
        var type = data.readUInt8(0);
        if (type === 0x81) {
            var version = data.toString('utf-8', 2, 7);
            this.eventEmitter.emit('configuration:ble-protocol-version', version);
            return;
        }
    };
    ConfigurationCharacteristic.prototype.onData = function (data) {
        this.data2result(data);
    };
    ConfigurationCharacteristic.UUID = '10b201ff5b3b45719508cf3efcd7bbae';
    return ConfigurationCharacteristic;
}());
exports.ConfigurationCharacteristic = ConfigurationCharacteristic;
//# sourceMappingURL=configuration-characteristic.js.map