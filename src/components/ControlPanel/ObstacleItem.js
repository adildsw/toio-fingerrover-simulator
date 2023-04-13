import { Header, Icon } from "semantic-ui-react";

import './ObstacleItem.css';

const ObstacleItem = (props) => {
    const { idx, obstacleProps, toioProps } = props;
    const { obstacles, setObstacles, minObstacleSize, maxObstacleSize, obstaclePadding } = obstacleProps;
    const { matSize } = toioProps;

    const obstacle = obstacles[idx];

    const setObstacleRadius = (radius) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].radius = parseInt(radius);
        
        const minX = newObstacles[idx].radius + obstaclePadding;
        const maxX = matSize - newObstacles[idx].radius - obstaclePadding;
        const minY = newObstacles[idx].radius + obstaclePadding;
        const maxY = matSize - newObstacles[idx].radius - obstaclePadding;

        newObstacles[idx].x = newObstacles[idx].x < minX ? minX : newObstacles[idx].x > maxX ? maxX : newObstacles[idx].x;
        newObstacles[idx].y = newObstacles[idx].y < minY ? minY : newObstacles[idx].y > maxY ? maxY : newObstacles[idx].y;

        setObstacles(newObstacles);
    }

    const setObstacleStatus = (isDisabled) => {
        const newObstacles = [...obstacles];
        newObstacles[idx].isDisabled = isDisabled;
        setObstacles(newObstacles);
    }

    const navigateToObstacle = () => {
        console.log("Navigating to obstacle " + obstacle.id);
        // TODO: Navigate to obstacle
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
                    onChange={(e) => { setObstacleRadius(e.target.value); }} 
                    disabled={obstacle.isDisabled}
                />

                <div className='obstacle-item-locate-button' onClick={() => { if (!obstacle.isDisabled) navigateToObstacle(); }}>
                    <Icon name='location arrow' size='small' color='grey' />
                </div>
            </div>
            
            <div className='obstacle-item-enable-btn' onClick={() => { setObstacleStatus(!obstacle.isDisabled); }}>
                <Icon name={'eye' + (obstacle.isDisabled ? ' slash' : '')} size='large' color='grey' />
            </div>
        </div>
    )
}

export default ObstacleItem;