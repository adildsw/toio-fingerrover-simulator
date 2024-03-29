"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonCharacteristic = void 0;
var button_spec_1 = require("./specs/button-spec");
var ButtonCharacteristic = (function () {
    function ButtonCharacteristic(characteristic, eventEmitter) {
        this.spec = new button_spec_1.ButtonSpec();
        this.characteristic = characteristic;
        if (this.characteristic.properties.includes('notify')) {
            this.characteristic.on('data', this.onData.bind(this));
            this.characteristic.subscribe();
        }
        this.eventEmitter = eventEmitter;
    }
    ButtonCharacteristic.prototype.getButtonStatus = function () {
        return this.read().then(function (data) {
            return { pressed: data.data.pressed };
        });
    };
    ButtonCharacteristic.prototype.read = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.characteristic.read(function (error, data) {
                if (error) {
                    reject(error);
                    return;
                }
                if (!data) {
                    reject('cannot read any data from characteristic');
                    return;
                }
                try {
                    var parsedData = _this.spec.parse(data);
                    resolve(parsedData);
                    return;
                }
                catch (e) {
                    reject(e);
                    return;
                }
            });
        });
    };
    ButtonCharacteristic.prototype.onData = function (data) {
        try {
            var parsedData = this.spec.parse(data);
            this.eventEmitter.emit('button:press', { pressed: parsedData.data.pressed });
        }
        catch (e) {
            return;
        }
    };
    ButtonCharacteristic.UUID = '10b201075b3b45719508cf3efcd7bbae';
    return ButtonCharacteristic;
}());
exports.ButtonCharacteristic = ButtonCharacteristic;
//# sourceMappingURL=button-characteristic.js.map