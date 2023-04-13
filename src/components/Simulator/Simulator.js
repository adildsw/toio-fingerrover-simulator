import { useState } from "react";
import useImage from 'use-image';
import { Stage, Layer, Circle, Image, Rect, Group, Arrow, Text, Line } from 'react-konva';
import './Simulator.css'

// Toio Dimensions: 32mm x 32mm
// Toio Mat Dimensions: 557mm x 557mm

const Simulator = (props) => {
    const { mouseProps, toioProps, obstacleProps, systemProps } = props;
    const { toioSize, matSize, isAltMat, setIsAltMat } = toioProps;
    const { position, rotation, target, status, setTarget } = systemProps;
    const { mousePos, setMousePos, isMouseOver, setIsMouseOver } = mouseProps;

    const { obstaclePadding } = obstacleProps;

    const [matImg] = useImage('./assets/toio_collection_front.png');
    const [matAltImg] = useImage('./assets/toio_collection_back.png');

    const setObstaclePosition = (obstacle, x, y) => {
        const { obstacles, setObstacles } = obstacleProps;
        const newObstacles = [...obstacles];
        const index = newObstacles.indexOf(obstacle);
        newObstacles[index] = { ...obstacle, x: x, y: y };
        setObstacles(newObstacles);
    }

    const getObstacleDragProps = (obstacle) => {
        return {
            x: obstacle.x,
            y: obstacle.y,
            draggable: true,
            dragBoundFunc: (pos) => {
                const minX = obstacle.radius + obstaclePadding;
                const maxX = matSize - obstacle.radius - obstaclePadding;
                const minY = obstacle.radius + obstaclePadding;
                const maxY = matSize - obstacle.radius - obstaclePadding;
                return {
                    x: pos.x < minX ? minX : pos.x > maxX ? maxX : pos.x,
                    y: pos.y < minY ? minY : pos.y > maxY ? maxY : pos.y
                }
            },
            onDragMove: (e) => {
                const { x, y } = e.target.attrs;
                setObstaclePosition(obstacle, x, y);
                if (target.isActive) clearTarget();
            }
        }
    }

    const renderObstacles = () => {
        const { obstacles } = obstacleProps;
        return obstacles.map((obstacle) => {
            return (
                !obstacle.isDisabled && 
                <>
                    <Circle 
                        fillEnabled={true} 
                        fill='#00000022'
                        radius={obstacle.radius + obstaclePadding} 
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Circle 
                        fillEnabled={true} 
                        fill='#00000042'
                        radius={obstacle.radius} 
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Text
                        text={obstacle.id}
                        x={obstacle.x}
                        y={obstacle.y}
                        fill='#121212'
                        fontStyle='bold'
                        fontSize={30}
                        align='center'
                        verticalAlign='middle'
                        offsetX={16}
                        offsetY={22}
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Text
                        text={obstacle.radius + ' mm'}
                        x={obstacle.x}
                        y={obstacle.y}
                        fill='#121212'
                        fontSize={14}
                        align='center'
                        verticalAlign='middle'
                        offsetX={22}
                        offsetY={-7}
                        {...getObstacleDragProps(obstacle)}
                    />
                </>
            )
        });
    }

    const clearTarget = () => {
        setTarget({ x: 0, y: 0, isActive: false });
    }

    return (
        <div className="simulator">
            <Stage width={matSize} height={matSize}>
                <Layer>
                    {/* Toio Mat */}
                    <Image
                        image={isAltMat ? matAltImg : matImg}
                        width={matSize}
                        height={matSize}
                        onMouseMove={(e) => { setMousePos({ x: e.evt.offsetX, y: e.evt.offsetY }); }}
                        onMouseEnter={() => { setIsMouseOver(true); }}
                        onMouseLeave={() => { setIsMouseOver(false); }}
                        onClick={() => { if (isMouseOver) setTarget({ x: mousePos.x, y: mousePos.y, isActive: true }); }}
                    />

                    {/* Toio */}
                    { status !== 0 && 
                        <Group draggable x={position.x} y={position.y} rotation={rotation}>
                            <Rect
                                fillEnabled={true}
                                fill='white'
                                stroke='grey'
                                strokeWidth={2}
                                width={toioSize}
                                height={toioSize}
                                cornerRadius={5}
                                x={-toioSize / 2}
                                y={-toioSize / 2}
                            />
                            <Circle 
                                fillEnabled={true} 
                                fill='grey' 
                                radius={8} 
                                x={0} 
                                y={0} 
                            />
                            <Arrow points={[0, 20, 0, 13 + toioSize / 2]} fill='grey' opacity={0.5} />
                        </Group>
                    }

                    {/* Obstacles */}
                    <Group>
                        {renderObstacles()}
                    </Group>

                    {/* Target */}
                    {
                        target.isActive &&
                        <Group>
                            <Line
                                points={[target.x - 20 / 2, target.y - 20 / 2, target.x + 20 / 2, target.y + 20 / 2]}
                                stroke='#c72b2b'
                                strokeWidth={5}
                            />
                            {/* Vertical line */}
                            <Line
                                points={[target.x - 20 / 2, target.y + 20 / 2, target.x + 20 / 2, target.y - 20 / 2]}
                                stroke='red'
                                strokeWidth={5}
                            />
                        </Group>
                    }

                    {/* Mouse */}
                    { 
                        mouseProps.isMouseOver && 
                        <Circle 
                            fillEnabled={false} 
                            stroke='grey' 
                            strokeWidth={2} 
                            radius={10} 
                            x={mouseProps.mousePos.x} 
                            y={mouseProps.mousePos.y} 
                        /> 
                    }
                </Layer>
            </Stage>
        </div>
    );
}

export default Simulator;