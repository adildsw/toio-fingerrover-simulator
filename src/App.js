import { useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';
import useWebSocket from 'react-use-websocket';

import { generateObstacles, getProcessedPosition, getRawObstacleConfiguration, getRawPosition, isPositionInAltMat } from './utils/Utils';
import Simulator from './components/Simulator/Simulator';
import ControlPanel from './components/ControlPanel/ControlPanel';

import './App.css';
import Direction from './utils/enums/Direction';


const BACKEND_URL = 'ws://127.0.0.1:8000';

const OBSTACLE_COUNT = 4;
const MIN_OBSTACLE_SIZE = 20;
const MAX_OBSTACLE_SIZE = 80;
const OBSTACLE_PADDING = 20;

const TOIO_SIZE = 32;
const MAT_SIZE = 557;
const MIN_TOIO_SPEED = 10;
const MAX_TOIO_SPEED = 50;


const App = () => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isAltMat, setIsAltMat] = useState(false);
    const [obstacles, setObstacles] = useState(
        generateObstacles(
            OBSTACLE_COUNT,
            MIN_OBSTACLE_SIZE,
            MAX_OBSTACLE_SIZE,
            OBSTACLE_PADDING,
            MAT_SIZE
        )
    );

    const [toioSpeed, setToioSpeed] = useState(20);
    const [target, setTarget] = useState({ x: 0, y: 0, isActive: false });

    const [controlData, setControlData] = useState({ type: '', data: {} });
    const [toioStatus, setToioStatus] = useState({ x: 0, y: 0, angle: 0, status: 0 });

    const { sendMessage } = useWebSocket(BACKEND_URL, {
        onOpen: () => console.log('[STATUS] Backend connected'),
        onMessage: (event) => {
            var rawData = JSON.parse(event.data);
            var processedPath = rawData.path.map((point) => {
                return getProcessedPosition(point.x, point.y, MAT_SIZE);
            });
            var processedData = {
                ...rawData,
                ...getProcessedPosition(rawData.x, rawData.y, MAT_SIZE),
                path: processedPath
            };
            if (processedData.status === 0 || processedData.status === 1) {
                setTarget({ x: 0, y: 0, isActive: false });
            }
            setToioStatus(processedData);
            setIsAltMat(isPositionInAltMat(rawData.x));
        },
        retryOnError: true,
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 9999
    });


    useEffect(() => {
        sendMessage(JSON.stringify(controlData));
    }, [controlData, sendMessage]);

    useEffect(() => {
        window.onkeydown = (e) => {
            const char = String.fromCharCode(e.keyCode);
            if (!['W', 'A', 'S', 'D'].includes(char)) return;
            setTarget({ x: 0, y: 0, isActive: false });
            setControlData((prevVal) => {
                if (prevVal.type === 'manual' && prevVal.data.direction === Direction[char]) return prevVal;
                return {
                    type: 'manual',
                    data: {
                        direction: Direction[char],
                        speed: toioSpeed
                    }
                };
            });
        }

        window.onkeyup = (e) => {
            var char = String.fromCharCode(e.keyCode);
            if (!['W', 'A', 'S', 'D'].includes(char)) return;
            stopToio();
        }
    }, [toioSpeed]);

    const stopToio = () => {
        setTarget({ x: 0, y: 0, isActive: false });
        setControlData({
            type: 'manual',
            data: {
                direction: 'stop',
                speed: 0
            }
        });
    }

    const moveToTarget = (x, y) => {
        setTarget({ x: x, y: y, isActive: true });
        setControlData({
            type: 'auto',
            data: {
                target: { ...getRawPosition(x, y, MAT_SIZE, isAltMat) },
                obstacles: getRawObstacleConfiguration(obstacles, OBSTACLE_PADDING, MAT_SIZE, isAltMat),
                speed: toioSpeed
            }
        });
    }

    const closeServer = () => {
        setControlData({...controlData, type: 'close'});
    }


    const mouseProps = { mousePos, setMousePos, isMouseOver, setIsMouseOver };
    const obstacleProps = { obstacles, setObstacles, obstacleCount: OBSTACLE_COUNT, minObstacleSize: MIN_OBSTACLE_SIZE, maxObstacleSize: MAX_OBSTACLE_SIZE, obstaclePadding: OBSTACLE_PADDING };
    const toioProps = { toioSize: TOIO_SIZE, matSize: MAT_SIZE, isAltMat, setIsAltMat, minToioSpeed: MIN_TOIO_SPEED, maxToioSpeed: MAX_TOIO_SPEED };
    const systemProps = { toioStatus, target, toioSpeed, setToioSpeed, moveToTarget, stopToio, closeServer };

    return (
        <Grid className={'parent-grid'}>
            <Grid.Column className={'simulator-grid'} width={10}>
                <Simulator mouseProps={mouseProps} obstacleProps={obstacleProps} toioProps={toioProps} systemProps={systemProps} />
            </Grid.Column>
            <Grid.Column className={'control-panel-grid'} width={6}>
                <ControlPanel mouseProps={mouseProps} obstacleProps={obstacleProps} toioProps={toioProps} systemProps={systemProps} />
            </Grid.Column>
        </Grid>
    );
}

export default App;
