import { Grid } from 'semantic-ui-react';
import './App.css';
import Simulator from './components/Simulator/Simulator';
import ControlPanel from './components/ControlPanel/ControlPanel';
import { useEffect, useState } from 'react';

import useWebSocket from 'react-use-websocket';
import { getRandomCirclePointWithinBounds } from './utils/MathUtils';

const WEBSOCKET_URL = 'ws://192.168.0.152:8000';

const OBSTACLE_COUNT = 5;
const MIN_OBSTACLE_SIZE = 30;
const MAX_OBSTACLE_SIZE = 90;
const OBSTACLE_PADDING = 20;

const TOIO_SIZE = 32;
const MAT_SIZE = 557;
const MAX_POSITION = 410; // Clear Mat: (45 to 455) | Chess Mat: (545 to 955)

const App = () => {

  const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
    onOpen: () => console.log('opened'),
    onMessage: (event) => {
      var jsonData = JSON.parse(event.data);
      if (typeof jsonData === 'string') jsonData = JSON.parse(jsonData);

      if (jsonData.type === 'position-id') {
        setCurrentStatus(jsonData.status);

        if (jsonData.x >= 45 && jsonData.x <= 455) {
          jsonData.x = (jsonData.x - 45) / MAX_POSITION * MAT_SIZE;
          setIsAltMat(false);
        } 
        else if(jsonData.x >= 545 && jsonData.x <= 955) {
          jsonData.x = (jsonData.x - 545) / MAX_POSITION * MAT_SIZE;
          setIsAltMat(true);
        }
        
        jsonData.y = (jsonData.y - 45) / MAX_POSITION * MAT_SIZE;
        setCurrentPosition({ x: parseInt(jsonData.x), y: parseInt(jsonData.y) });
        setCurrentRotation(jsonData.angle);
      }
      else if (jsonData.type === 'disconnected') {
        setDisconnected();
      }
    }
  });

  const generateObstacles = () => {
    const obstacles = [];
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const radius = Math.floor(Math.random() * (MAX_OBSTACLE_SIZE - MIN_OBSTACLE_SIZE) + MIN_OBSTACLE_SIZE);
      const pos = getRandomCirclePointWithinBounds(radius + OBSTACLE_PADDING, MAT_SIZE);
      obstacles.push({
        id: '#' + (i + 1),
        x: pos.x,
        y: pos.y,
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

  const [currentStatus, setCurrentStatus] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState(0);
  const [target, setTarget] = useState({ x: 0, y: 0, isActive: false });
  const [currentMove, setCurrentMove] = useState(0);


  useEffect(() => {
    window.onkeydown = (e) => {
      var char = String.fromCharCode(e.keyCode);
      if (char !== 'W' && char !== 'A' && char !== 'S' && char !== 'D') return;
      setCurrentStatus(3);
      setTarget({ x: 0, y: 0, isActive: false });

      setCurrentMove((oldValue) => {
        if (char !== oldValue) {
          return char;
        }
        return char;
      });
    }

    window.onkeyup = (e) => {
      var char = String.fromCharCode(e.keyCode);
      if (char !== 'W' && char !== 'A' && char !== 'S' && char !== 'D') return;
      setCurrentStatus(1);

      setCurrentMove((oldValue) => {
        if (char === oldValue) {
          return 0;
        }
        return oldValue;
      });
    }
  }, []);

  useEffect(() => {
    console.log(currentMove);
    sendMessage(currentMove);
  }, [currentMove, sendMessage]);

  const stopAutoNavigation = () => {
    if (currentStatus === 0) {
      setDisconnected();
      return;
    }

    if (currentStatus !== 2) return;
    setCurrentStatus(1);
    setCurrentMove("0");
  }

  const clearTarget = () => {
    setTarget({ x: 0, y: 0, isActive: false });
    stopAutoNavigation();
  }

  const moveToTarget = (x, y) => {
    if (currentStatus === 0) {
      setDisconnected();
      return;
    }

    if (target.isActive) clearTarget();
    setTarget({ x: x, y: y, isActive: true });
    setCurrentStatus(2);

    const autoNavData = { 'sourceX': currentPosition.x, 'sourceY': currentPosition.y, 'targetX': x, 'targetY': y, obstacles: obstacles };
    const autoNavString = "Auto," + JSON.stringify(autoNavData);
    setCurrentMove(autoNavString);
  }

  const setDisconnected = () => {
    setCurrentStatus(0);
    setCurrentPosition({ x: 0, y: 0 });
    setCurrentRotation(0);
    setTarget({ x: 0, y: 0, isActive: false });
  }

  const mouseProps = { mousePos, setMousePos, isMouseOver, setIsMouseOver };
  const obstacleProps = { obstacles: obstacles, setObstacles: setObstacles, obstacleCount: OBSTACLE_COUNT, minObstacleSize: MIN_OBSTACLE_SIZE, maxObstacleSize: MAX_OBSTACLE_SIZE, obstaclePadding: OBSTACLE_PADDING };
  const toioProps = { toioSize: TOIO_SIZE, matSize: MAT_SIZE, maxPosition: MAX_POSITION, isAltMat: isAltMat, setIsAltMat: setIsAltMat };
  const systemProps = { status: currentStatus, setStatus: setCurrentStatus, position: currentPosition, setPosition: setCurrentPosition, rotation: currentRotation, setRotation: setCurrentRotation, target: target, moveToTarget: moveToTarget, clearTarget: clearTarget };

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
