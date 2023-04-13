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
    
    let d = Math.sqrt(dx*dx + dy*dy);
    
    let dirX = dx / d;
    let dirY = dy / d;
    
    let cx = x + dirX * (d - radius);
    let cy = y + dirY * (d - radius);
    
    return {x: parseInt(cx), y: parseInt(cy)};
  }