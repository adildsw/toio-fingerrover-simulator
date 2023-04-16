const { WebSocketServer } = require('ws');
const { v4 } = require('uuid');
const http = require('http');
const PF = require('pathfinding');
const { NearestScanner } = require('./toio-lib/scanner');


const executeToioBackend = async () => {
    /*
    * |-----------------------------
    * | DECLARING GLOBAL VARIABLES
    * |-----------------------------
    */
    const HOST = '127.0.0.1';
    const PORT = 8000;

    const DISTANCE_THRESHOLD = 15;
    const MAX_NORMALIZED_POSITION = 410;
    const MAT_OFFSET = 45;
    const ALT_MAT_OFFSET = 545;

    const toioStatus = { x: 0, y: 0, angle: 0, status: 0, path: [] };
    var targetPoint = { x: 0, y: 0 };
    var obstacleConfiguration = [];
    var grid = new PF.Grid(MAX_NORMALIZED_POSITION, MAX_NORMALIZED_POSITION);
    var pathFinder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
        heuristic: PF.Heuristic.chebyshev,
    });

    const DIRECTION = {
        forward: [1, 1],
        backward: [-1, -1],
        left: [-1, 1],
        right: [1, -1],
        stop: [0, 0]
    }


    /*
    * |-----------------------------
    * | ESTABLISHING SERVER
    * |-----------------------------
    */
    const server = http.createServer();
    const wsServer = new WebSocketServer({ server });

    const clients = {};
    const broadcast = (data) => {
        Object.values(clients).forEach((client) => {
            client.send(JSON.stringify(data));
        });
    };

    server.listen(PORT, HOST, () => {
        console.log(`[STATUS] Backend running on ws://${HOST}:${PORT}`);
        console.log('[STATUS] Scanning for Toio cube...');
    });


    /*
    * |-----------------------------
    * | SCANNING FOR TOIO CUBE
    * |-----------------------------
    */
    const cube = await new NearestScanner().start();
    console.log('[STATUS] Toio cube detected, connecting...');

    await cube.connect();
    console.log('[STATUS] Toio cube connected');


    /*
    * |-----------------------------
    * | HANDLING TOIO EVENTS
    * |-----------------------------
    */
    cube.on('id:position-id', (data) => {
        if (toioStatus['status'] === 0) {
            console.log('[STATUS] Toio position detected');
            toioStatus['status'] = 1;
        }
        toioStatus['x'] = data.x;
        toioStatus['y'] = data.y;
        toioStatus['angle'] = data.angle;
        broadcast(toioStatus);

        const dist = distance(data.x, data.y, targetPoint.x, targetPoint.y);
        if (toioStatus['status'] === 3 && dist < DISTANCE_THRESHOLD) {
            stopToio();
            cube.playPresetSound(1);
        }
    });

    cube.on('id:position-id-missed', () => {
        console.log('[STATUS] Toio position missed');
        toioStatus['status'] = 0;
        broadcast(toioStatus);
    });


    /*
    * |-----------------------------
    * | HANDLING TOIO MOVEMENT
    * |-----------------------------
    */
    const stopToio = () => {
        toioStatus['status'] = 1;
        toioStatus['path'] = [];
        cube.move(...DIRECTION.stop, 0);
    }

    const handleManualControl = (direction, speed) => {
        toioStatus['status'] = direction === 'stop' ? 1 : 2;
        cube.move(...DIRECTION[direction].map(element => element * speed), 0);
    }

    const handleAutoControl = (target, obstacles, speed) => {
        targetPoint = target;
        var { normalizedSource, normalizedTarget, normalizedObstacles } = normalizeAutoNavData(toioStatus, target, obstacles);

        updateObstacleMap(normalizedObstacles);
        
        var path = pathFinder.findPath(normalizedSource.x, normalizedSource.y, normalizedTarget.x, normalizedTarget.y, grid.clone());
        path = PF.Util.smoothenPath(grid.clone(), path);

        var formattedPath = [];
        for (let i = 0; i < path.length; i++) {
            const offset = isPositionInAltMat(toioStatus.x, toioStatus.y) ? ALT_MAT_OFFSET : MAT_OFFSET;
            formattedPath.push({ x: path[i][0] + offset, y: path[i][1] + MAT_OFFSET });
        }
        
        toioStatus['status'] = 3;
        toioStatus['path'] = formattedPath;
        console.log(`[STATUS] Auto-navigating to (${normalizedTarget.x}, ${normalizedTarget.y})`);

        cube
            .moveTo(formattedPath, { moveType: 0, maxSpeed: speed, speedType: 3, timeout: 0, overwrite: true })
            .catch((error) => {
                console.log(error);
                stopToio();
            });
    }


    /*
    * |-----------------------------
    * | HANDLING CONTROL REQUESTS
    * |-----------------------------
    */
    wsServer.on('connection', function (connection) {
        const userId = v4();
        clients[userId] = connection;
        console.log(`[STATUS] Frontend connected`);

        clients[userId].on('message', function (message) {
            const controlData = JSON.parse(message.toString());
            console.log('[STATUS] Received control data:', controlData);

            if (controlData.type === 'manual') {
                handleManualControl(
                    controlData.data.direction,
                    controlData.data.speed
                );
            }
            else if (controlData.type === 'auto') {
                handleAutoControl(
                    controlData.data.target,
                    controlData.data.obstacles,
                    controlData.data.speed
                );
            }
            else if (controlData.type === 'close') {
                stopToio();
                cube.disconnect();
                console.log('[STATUS] Toio cube disconnected');
                process.exit();
            }
            else stopToio();
        });
    });


    /*
    * |-----------------------------
    * | UTILS
    * |-----------------------------
    */
    const distance = (x1, y1, x2, y2) => {
        return Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
    }

    const isPositionInAltMat = (x, y) => {
        return x >= ALT_MAT_OFFSET;
    }

    const normalizePosition = (x, y) => {
        if (isPositionInAltMat(x, y)) x -= ALT_MAT_OFFSET;
        else x -= MAT_OFFSET;
        y -= MAT_OFFSET;
        return { x, y };
    }

    const normalizeAutoNavData = (sourcePosition, targetPosition, obstacleData) => {
        var normalizedSource = normalizePosition(sourcePosition.x, sourcePosition.y);
        var normalizedTarget = normalizePosition(targetPosition.x, targetPosition.y);
        var normalizedObstacles = [];
        for (let i = 0; i < obstacleData.length; i++) {
            normalizedObstacles.push({
                ...normalizePosition(obstacleData[i].x, obstacleData[i].y), 
                radius: obstacleData[i].radius, 
                isActive: obstacleData[i].isActive
            });
        }
        return {normalizedSource, normalizedTarget, normalizedObstacles};
    }

    const hasObstacleConfigurationChanged = (oldObstacles, newObstacles) => {
        oldObstacles = JSON.stringify(oldObstacles);
        newObstacles = JSON.stringify(newObstacles);
        return oldObstacles !== newObstacles;
    }

    const updateObstacleMap = (newObstacleData) => {
        if (hasObstacleConfigurationChanged(obstacleConfiguration, newObstacleData)) {
            obstacleConfiguration = newObstacleData;

            grid = new PF.Grid(MAX_NORMALIZED_POSITION, MAX_NORMALIZED_POSITION);
            for (var i = 0; i < MAX_NORMALIZED_POSITION; i++) {
                for (var j = 0; j < MAX_NORMALIZED_POSITION; j++) {
                    for (var k = 0; k < obstacleConfiguration.length; k++) {
                        if (obstacleConfiguration[k].isActive && distance(j, i, obstacleConfiguration[k].x, obstacleConfiguration[k].y) < obstacleConfiguration[k].radius) {
                            grid.setWalkableAt(j, i, false);
                        }
                    }
                }
            }
            console.log("[STATUS] Obstacle map updated");
        }
    }
      
}


executeToioBackend();