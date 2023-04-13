import { Header, Icon } from "semantic-ui-react";

import './ObstacleItem.css';
import { getClosestPointToCircle, getNearestCirclePointWithinBounds } from "../../utils/MathUtils";

const ObstacleItem = (props) => {
    const { idx, obstacleProps, toioProps, systemProps } = props;
    const { obstacles, setObstacles, minObstacleSize, maxObstacleSize, obstaclePadding } = obstacleProps;
    const { matSize } = toioProps;
    const { position, moveToTarget, clearTarget } = systemProps;

    const obstacle = obstacles[idx];

    const setObstacleRadius = (radius) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].radius = parseInt(radius);

        const newPos = getNearestCirclePointWithinBounds(newObstacles[idx].radius + obstaclePadding, matSize, newObstacles[idx].x, newObstacles[idx].y);
        newObstacles[idx].x = newPos.x;
        newObstacles[idx].y = newPos.y;

        setObstacles(newObstacles);
    }

    const setObstacleStatus = (isDisabled) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].isDisabled = isDisabled;
        setObstacles(newObstacles);
    }

    const navigateToObstacle = () => {
        const targetPos = getClosestPointToCircle(position.x, position.y, obstacle.x, obstacle.y, obstacle.radius + obstaclePadding);
        moveToTarget(targetPos.x, targetPos.y);
    }

    return (
        <div className={obstacle.isDisabled ? 'obstacle-item-container-disabled' : 'obstacle-item-container'}>
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
                    onChange={(e) => { setObstacleRadius(e.target.value); clearTarget(); }} 
                    disabled={obstacle.isDisabled}
                />

                <div className='obstacle-item-locate-button' onClick={() => { if (!obstacle.isDisabled) navigateToObstacle(); }}>
                    <Icon name='location arrow' size='small' color='grey' />
                </div>
            </div>
            
            <div className='obstacle-item-enable-btn' onClick={() => { setObstacleStatus(!obstacle.isDisabled); clearTarget(); }}>
                <Icon name={'eye' + (obstacle.isDisabled ? ' slash' : '')} size='large' color='grey' />
            </div>
        </div>
    )
}

export default ObstacleItem;