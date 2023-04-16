/// <reference types="node" />
/// <reference types="node" />
export type DataType = {
    buffer: Uint8Array;
    data: {
        isSloped: boolean;
        isCollisionDetected: boolean;
        isDoubleTapped: boolean;
        orientation: number;
        shakeLevel: number;
    };
    dataType: 'sensor:motion';
} | {
    buffer: Uint8Array;
    data: {
        id: number;
        force: number;
        directionX: number;
        directionY: number;
        directionZ: number;
    };
    dataType: 'sensor:magnet';
} | {
    buffer: Uint8Array;
    data: {
        roll: number;
        pitch: number;
        yaw: number;
    };
    dataType: 'sensor:attitude-euler';
} | {
    buffer: Uint8Array;
    data: {
        w: number;
        x: number;
        y: number;
        z: number;
    };
    dataType: 'sensor:attitude-quaternion';
};
export declare class SensorSpec {
    parse(buffer: Buffer): DataType;
}
