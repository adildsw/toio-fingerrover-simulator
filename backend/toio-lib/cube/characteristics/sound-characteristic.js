"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundCharacteristic = void 0;
var sound_spec_1 = require("./specs/sound-spec");
var SoundCharacteristic = (function () {
    function SoundCharacteristic(characteristic) {
        this.spec = new sound_spec_1.SoundSpec();
        this.timer = null;
        this.pendingResolve = null;
        this.characteristic = characteristic;
    }
    SoundCharacteristic.prototype.playPresetSound = function (soundId) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var data = this.spec.playPresetSound(soundId);
        this.characteristic.write(Buffer.from(data.buffer), false);
    };
    SoundCharacteristic.prototype.playSound = function (operations, repeatCount) {
        var _this = this;
        if (repeatCount === void 0) { repeatCount = 0; }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var data = this.spec.playSound(operations, repeatCount);
        this.characteristic.write(Buffer.from(data.buffer), false);
        if (data.data.totalDurationMs > 0) {
            return new Promise(function (resolve) {
                _this.pendingResolve = resolve;
                _this.timer = setTimeout(function () {
                    if (_this.pendingResolve) {
                        _this.pendingResolve();
                        _this.pendingResolve = null;
                    }
                }, data.data.totalDurationMs);
            });
        }
    };
    SoundCharacteristic.prototype.stopSound = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.pendingResolve) {
            this.pendingResolve();
            this.pendingResolve = null;
        }
        var data = this.spec.stopSound();
        this.characteristic.write(Buffer.from(data.buffer), false);
    };
    SoundCharacteristic.UUID = '10b201045b3b45719508cf3efcd7bbae';
    return SoundCharacteristic;
}());
exports.SoundCharacteristic = SoundCharacteristic;
//# sourceMappingURL=sound-characteristic.js.map