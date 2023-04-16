import { saveAs } from 'file-saver';

const MAT_OFFSET = 45;
const ALT_MAT_OFFSET = 545;
const MAX_POSITION = 410;

export const isPositionInAltMat = (rawXPos) => {
    return rawXPos > ALT_MAT_OFFSET;
}

export const getProcessedPosition = (rawXPos, rawYPos, boundSize) => {
    const offset = isPositionInAltMat(rawXPos) ? ALT_MAT_OFFSET : MAT_OFFSET;
    const x = Math.floor((rawXPos - offset) / MAX_POSITION * boundSize);
    const y = Math.floor((rawYPos - MAT_OFFSET) / MAX_POSITION * boundSize);
    return { x: parseInt(x), y: parseInt(y) };
}

export const getRawPosition = (x, y, boundSize, isAltMat) => {
    const offset = isAltMat ? ALT_MAT_OFFSET : MAT_OFFSET;
    const rawXPos = Math.floor(x / boundSize * MAX_POSITION + offset);
    const rawYPos = Math.floor(y / boundSize * MAX_POSITION + MAT_OFFSET);
    return { x: parseInt(rawXPos), y: parseInt(rawYPos) };
}

export const generateObstacles = (count, minSize, maxSize, padding, boundSize) => {
    const obstacles = [];
    for (let i = 0; i < count; i++) {
        const radius = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const pos = getRandomCirclePointWithinBounds(radius + padding, boundSize);
        obstacles.push({
            id: '#' + (i + 1),
            x: pos.x,
            y: pos.y,
            radius: radius,
            isActive: Math.random() >= 0.5
        });
    }
    return obstacles;
};

export const getRawObstacleConfiguration = (obstacles, padding, boundSize, isAltMat) => {
    const rawObstacles = [];
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const rawPos = getRawPosition(obstacle.x, obstacle.y, boundSize, isAltMat);
        rawObstacles.push({
            id: obstacle.id,
            x: rawPos.x,
            y: rawPos.y,
            radius: (obstacle.radius + padding) / boundSize * MAX_POSITION,
            isActive: obstacle.isActive
        });
    }
    return rawObstacles;
}



/*
* |---------------------------
* | MATH UTILS
* |---------------------------
*/

export const getRandomCirclePointWithinBounds = (radius, boundSize) => {
    const x = Math.floor(Math.random() * (boundSize - radius * 2) + radius);
    const y = Math.floor(Math.random() * (boundSize - radius * 2) + radius);
    return { x, y };
}

export const getNearestCirclePointWithinBounds = (radius, boundSize, x, y) => {
    const minX = radius;
    const maxX = boundSize - radius;
    const minY = radius;
    const maxY = boundSize - radius;
    return {
        x: x < minX ? minX : x > maxX ? maxX : x,
        y: y < minY ? minY : y > maxY ? maxY : y
    };
}

export const getClosestPointToCircle = (x, y, circleX, circleY, radius) => {
    let dx = circleX - x;
    let dy = circleY - y;

    let d = Math.sqrt(dx * dx + dy * dy);

    let dirX = dx / d;
    let dirY = dy / d;

    let cx = x + dirX * (d - radius);
    let cy = y + dirY * (d - radius);

    return { x: parseInt(cx), y: parseInt(cy) };
}

/*
* |---------------------------
* | SAVE/LOAD UTILS
* |---------------------------
*/

export const saveObstacleConfigurations = (obstacles) => {
    const obstacleConfigurations = [];
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacleConfigurations.push({
            id: obstacle.id,
            x: obstacle.x,
            y: obstacle.y,
            radius: obstacle.radius,
            isActive: obstacle.isActive
        });
    }
    const blob = new Blob([JSON.stringify(obstacleConfigurations)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "obstacle_configurations.json");
}

export const loadObstaclesFromConfigurations = (configurationFile, setObstacles) => {
    if (!configurationFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const obstacles = JSON.parse(e.target.result);
        setObstacles(obstacles);
    }
    reader.readAsText(configurationFile);
}