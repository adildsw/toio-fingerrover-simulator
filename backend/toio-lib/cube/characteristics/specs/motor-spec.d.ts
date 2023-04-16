/// <reference types="node" />
/// <reference types="node" />
export type MotorResponse = {
    buffer: Buffer;
    data: {
        operationId: number;
        reason: number;
    };
    dataType: 'motor:moveTo-response';
} | {
    buffer: Buffer;
    data: {
        left: number;
        right: number;
    };
    dataType: 'motor:speed-feedback';
};
export interface MoveType {
    buffer: Uint8Array;
    data: {
        left: number;
        right: number;
        durationMs: number;
    };
}
export interface MoveToTarget {
    x?: number;
    y?: number;
    angle?: number;
    rotateType?: number;
}
export interface MoveToOptions {
    moveType: number;
    maxSpeed: number;
    speedType: number;
    timeout: number;
    overwrite: boolean;
}
export interface MoveToType {
    buffer: Uint8Array;
    data: {
        targets: MoveToTarget[];
        options: MoveToOptions & {
            operationId: number;
        };
    };
}
export interface AccelerationMoveType {
    buffer: Uint8Array;
    data: {
        straightSpeed: number;
        rotationSpeed: number;
        acceleration: number;
        priorityType: number;
        durationMs: number;
    };
}
export declare class MotorSpec {
    private tag;
    constructor(tag?: {
        current: () => number;
        next: () => number;
    });
    static MAX_SPEED: number;
    static MAX_ROTATION: number;
    static NUMBER_OF_TARGETS_PER_OPERATION: number;
    static ACC_PRIORITY_STRAIGHT: number;
    static ACC_PRIORITY_ROTATION: number;
    parse(buffer: Buffer): MotorResponse;
    move(left: number, right: number, durationMs?: number): MoveType;
    moveTo(targets: MoveToTarget[], options: MoveToOptions): MoveToType;
    accelerationMove(translationSpeed: number, rotationSpeed: number, acceleration?: number, priorityType?: number, durationMs?: number): AccelerationMoveType;
}
