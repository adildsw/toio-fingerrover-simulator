import { Header, Icon } from "semantic-ui-react";

import './ObstacleItem.css';
import { getClosestPointToCircle, getNearestCirclePointWithinBounds } from "../../utils/Utils";

const ObstacleItem = (props) => {
    const { idx, obstacleProps, toioProps, systemProps } = props;
    const { obstacles, setObstacles, minObstacleSize, maxObstacleSize, obstaclePadding } = obstacleProps;
    const { matSize } = toioProps;
    const { toioStatus, moveToTarget, stopToio } = systemProps;

    const obstacle = obstacles[idx];

    const setObstacleRadius = (radius) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].radius = parseInt(radius);

        const newPos = getNearestCirclePointWithinBounds(newObstacles[idx].radius + obstaclePadding, matSize, newObstacles[idx].x, newObstacles[idx].y);
        newObstacles[idx].x = newPos.x;
        newObstacles[idx].y = newPos.y;

        setObstacles(newObstacles);
    }

    const setObstacleStatus = (isActive) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].isActive = isActive;
        setObstacles(newObstacles);
    }

    const navigateToObstacle = () => {
        const targetPos = getClosestPointToCircle(toioStatus.x, toioStatus.y, obstacle.x, obstacle.y, obstacle.radius + obstaclePadding);
        moveToTarget(targetPos.x, targetPos.y);
    }

    return (
        <div key={idx} className={obstacle.isActive ? 'obstacle-item-container' : 'obstacle-item-container-disabled'}>
            <div className='obstacle-item-main-body'>
                <div className='obstacle-item-id'>
                    <Header className='obstacle-item-id-text' size='medium'>{obstacle.id}</Header>
                    <Header className='obstacle-item-range-value' size='tiny'>{obstacle.radius} mm</Header>
                </div>

                <input 
                    type='range' 
                    className='obstacle-item-range' 
                    value={obstacle.radius}
                    min={minObstacleSize}
                    max={maxObstacleSize}
                    onChange={(e) => { setObstacleRadius(e.target.value); stopToio(); }} 
                    disabled={!obstacle.isActive}
                />

                <div className={toioStatus.status !== 0 ? 'obstacle-item-locate-button' : 'obstacle-item-locate-button-disabled'} onClick={() => { if (obstacle.isActive && toioStatus.status !== 0) navigateToObstacle(); }}>
                    <Icon name='location arrow' size='small' color='grey' />
                </div>
            </div>
            
            <div className='obstacle-item-enable-btn' onClick={() => { setObstacleStatus(!obstacle.isActive); stopToio(); }}>
                <Icon name={'eye' + (obstacle.isActive ? '' : ' slash')} size='large' color='grey' />
            </div>
        </div>
    )
}

export default ObstacleItem;