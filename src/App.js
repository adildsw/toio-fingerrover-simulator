import { Grid } from 'semantic-ui-react';
import './App.css';
import Simulator from './components/Simulator/Simulator';
import ControlPanel from './components/ControlPanel/ControlPanel';
import { useState } from 'react';

import useWebSocket from 'react-use-websocket';

const WS_URL = 'ws://127.0.0.1:8000';

const OBSTACLE_COUNT = 5;
const MIN_OBSTACLE_SIZE = 30;
const MAX_OBSTACLE_SIZE = 90;
const OBSTACLE_PADDING = 20;

const TOIO_SIZE = 32;
const MAT_SIZE = 557;
const MAX_POSITION = 410; // Clear Mat: (45 to 455) | Chess Mat: (545 to 955)

const App = () => {

  useWebSocket(WS_URL, {
    onOpen: () => console.log('opened'),
    onMessage: (event) => console.log(event.data),
  });

  const generateObstacles = () => {
    const obstacles = [];
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const radius = Math.floor(Math.random() * (MAX_OBSTACLE_SIZE - MIN_OBSTACLE_SIZE) + MIN_OBSTACLE_SIZE);
      const x = Math.floor(Math.random() * (MAX_POSITION - radius - OBSTACLE_PADDING) + radius + OBSTACLE_PADDING);
      const y = Math.floor(Math.random() * (MAX_POSITION - radius - OBSTACLE_PADDING) + radius + OBSTACLE_PADDING);
      obstacles.push({
        id: '#' + (i + 1),
        x: x,
        y: y,
        radius: radius,
        isDisabled: Math.random() >= 0.5
      });
    }
    return obstacles;
  };

  const [isMouseOver, setIsMouseOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState(generateObstacles());
  const [isAltMat, setIsAltMat] = useState(false);

  const [currentStatus, setCurrentStatus] = useState(1);
  const [currentPosition, setCurrentPosition] = useState({ x: 32, y: 86 });
  const [currentRotation, setCurrentRotation] = useState(53);
  const [target, setTarget] = useState({ x: 132, y: 52, isActive: true });

  const mouseProps = { mousePos, setMousePos, isMouseOver, setIsMouseOver };
  const obstacleProps = { obstacles: obstacles, setObstacles: setObstacles, obstacleCount: OBSTACLE_COUNT, minObstacleSize: MIN_OBSTACLE_SIZE, maxObstacleSize: MAX_OBSTACLE_SIZE, obstaclePadding: OBSTACLE_PADDING };
  const toioProps = { toioSize: TOIO_SIZE, matSize: MAT_SIZE, maxPosition: MAX_POSITION, isAltMat: isAltMat, setIsAltMat: setIsAltMat };
  const systemProps = { status: currentStatus, setStatus: setCurrentStatus, position: currentPosition, setPosition: setCurrentPosition, rotation: currentRotation, setRotation: setCurrentRotation, target: target, setTarget: setTarget };

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
