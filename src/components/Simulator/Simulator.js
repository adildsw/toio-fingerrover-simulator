import useImage from 'use-image';
import { Stage, Layer, Circle, Image, Rect, Group, Arrow, Text, Line } from 'react-konva';
import './Simulator.css'
import { getNearestCirclePointWithinBounds } from "../../utils/Utils";

const Simulator = (props) => {
    const { mouseProps, toioProps, obstacleProps, systemProps } = props;
    const { toioSize, matSize, isAltMat } = toioProps;
    const { toioStatus, target, moveToTarget, stopToio } = systemProps;
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
                return getNearestCirclePointWithinBounds(obstacle.radius + obstaclePadding, matSize, pos.x, pos.y);
            },
            onDragMove: (e) => {
                const { x, y } = e.target.attrs;
                setObstaclePosition(obstacle, x, y);
                if (target.isActive) stopToio();
            }
        }
    }

    const renderObstacles = () => {
        const { obstacles } = obstacleProps;
        return obstacles.map((obstacle) => {
            return (
                obstacle.isActive && 
                <Group key={'groupObstacle' + obstacle.id}>
                    <Circle 
                        key={'shadow' + obstacle.id}
                        fillEnabled={true} 
                        fill='#00000022'
                        radius={obstacle.radius + obstaclePadding} 
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Circle 
                        key={obstacle.id}
                        fillEnabled={true} 
                        fill='#00000042'
                        radius={obstacle.radius} 
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Text
                        key={'text' + obstacle.id}
                        text={obstacle.id}
                        x={obstacle.x}
                        y={obstacle.y}
                        fill='#121212'
                        fontStyle='bold'
                        fontSize={20}
                        align='center'
                        verticalAlign='middle'
                        offsetX={13}
                        offsetY={14}
                        {...getObstacleDragProps(obstacle)}
                    />
                    <Text
                        key={'radius' + obstacle.id}
                        text={obstacle.radius + ' mm'}
                        x={obstacle.x}
                        y={obstacle.y}
                        fill='#121212'
                        fontSize={10}
                        align='center'
                        verticalAlign='middle'
                        offsetX={16}
                        offsetY={-4}
                        {...getObstacleDragProps(obstacle)}
                    />
                </Group>
            )
        });
    }

    const renderPath = () => {
        const { path } = toioStatus;
        const pathLines = [];
        for (let i = 0; i < path.length - 1; i++) {
            pathLines.push(
                <Line
                    key={'pathLine' + i}
                    points={[path[i].x, path[i].y, path[i + 1].x, path[i + 1].y]}
                    stroke='#828282'
                    strokeWidth={2}
                    dash={[2, 3]}
                />
            );
        }
        return (
            <Group key={'groupPath'}>
                {pathLines}
            </Group>
        );
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
                        onClick={() => { if (isMouseOver && toioStatus.status !== 0) moveToTarget(mousePos.x, mousePos.y); }}
                    />

                    {/* Toio */}
                    { toioStatus.status !== 0 && 
                        <Group x={toioStatus.x} y={toioStatus.y} rotation={toioStatus.angle}>
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
                            <Arrow points={[20, 0, 13 + toioSize / 2, 0]} fill='grey' opacity={0.5} />
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
                            <Line
                                points={[target.x - 20 / 2, target.y + 20 / 2, target.x + 20 / 2, target.y - 20 / 2]}
                                stroke='red'
                                strokeWidth={5}
                            />
                        </Group>
                    }

                    {/* Auto-Nav Path */}
                    {
                        toioStatus.status !== 0 && target.isActive && toioStatus.path.length > 0 &&
                        renderPath()
                    }

                    {/* Mouse */}
                    { 
                        mouseProps.isMouseOver && toioStatus.status !== 0 &&
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