"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdCharacteristic = void 0;
var id_spec_1 = require("./specs/id-spec");
var IdCharacteristic = (function () {
    function IdCharacteristic(characteristic, eventEmitter) {
        this.characteristic = characteristic;
        if (this.characteristic.properties.includes('notify')) {
            this.characteristic.on('data', this.onData.bind(this));
            this.characteristic.subscribe();
        }
        this.eventEmitter = eventEmitter;
    }
    IdCharacteristic.prototype.onData = function (data) {
        var idSpec = new id_spec_1.IdSpec();
        try {
            var ret = idSpec.parse(data);
            switch (ret.dataType) {
                case 'id:position-id':
                    this.eventEmitter.emit(ret.dataType, ret.data);
                    break;
                case 'id:standard-id':
                    this.eventEmitter.emit(ret.dataType, ret.data);
                    break;
                case 'id:position-id-missed':
                case 'id:standard-id-missed':
                    this.eventEmitter.emit(ret.dataType);
                    break;
                default:
                    break;
            }
        }
        catch (e) {
            return;
        }
    };
    IdCharacteristic.UUID = '10b201015b3b45719508cf3efcd7bbae';
    return IdCharacteristic;
}());
exports.IdCharacteristic = IdCharacteristic;
//# sourceMappingURL=id-characteristic.js.map