import { saveAs } from 'file-saver';

const MAT_START = 45;
const MAT_END = 455;
const ALT_MAT_START = 545;
const ALT_MAT_END = 955;

export const isToioInAltMat = (rawXPos) => {
    if (rawXPos >= MAT_START && rawXPos <= MAT_END) {
        return false;
    }
    else if (rawXPos >= ALT_MAT_START && rawXPos <= ALT_MAT_END) {
        return true;
    }
    return false;
}

export const getProcessedToioPosition = (rawXPos, rawYPos, boundSize) => {
    const offset = isToioInAltMat(rawXPos) ? ALT_MAT_START : MAT_START;
    const x = Math.floor((rawXPos - offset) / (MAT_END - MAT_START) * boundSize);
    const y = Math.floor((rawYPos - MAT_START) / (MAT_END - MAT_START) * boundSize);
    return { x: parseInt(x), y: parseInt(y) };
}

export const getRawToioPosition = (x, y, boundSize, isAltMat) => {
    const offset = isAltMat ? ALT_MAT_START : MAT_START;
    const rawXPos = Math.floor(x / boundSize * (MAT_END - MAT_START) + offset);
    const rawYPos = Math.floor(y / boundSize * (MAT_END - MAT_START) + MAT_START);
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