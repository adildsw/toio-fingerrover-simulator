import { Divider, Grid, Header, Icon } from 'semantic-ui-react';
import { saveAs } from 'file-saver';

import TitleBar from "./TitleBar";
import ObstacleItem from './ObstacleItem';

import './ControlPanel.css';
import { SYSTEM_STATUS } from '../../utils/SystemStatus';

const { shell } = window.require('electron');

const PAPER_URL = 'https://adildsw.github.io/docs/chi23_fingerrover_preprint.pdf';
const VIDEO_URL = 'https://www.youtube.com/watch?v=bhb8Q3gnuo0';
const GITHUB_URL = 'https://github.com/adildsw/toio-fingerrover-simulator';
const WEBSITE_URL = 'https://ultimateinterface.com';

const ControlPanel = (props) => {

    const { obstacleProps, toioProps, systemProps } = props;
    const { position, rotation, target, status } = systemProps;
    
    const renderObstacles = () => {
        let renderedObstacles = [];
        for (let i = 0; i < obstacleProps.obstacleCount; i++) {
            renderedObstacles.push(<ObstacleItem key={i} idx={i} obstacleProps={obstacleProps} toioProps={toioProps} />);
        }
        return renderedObstacles;
    }

    const saveObstacleConfigurations = () => {
        const obstacles = obstacleProps.obstacles;
        const obstacleConfigurations = [];
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            obstacleConfigurations.push({
                id: obstacle.id,
                x: obstacle.x,
                y: obstacle.y,
                radius: obstacle.radius,
                isDisabled: obstacle.isDisabled
            });
        }
        const blob = new Blob([JSON.stringify(obstacleConfigurations)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "obstacle_configurations.json");
    }

    const loadObstacleConfigurations = () => {

    }

        


    return (
        <div className='control-panel'>
            <TitleBar />
            
            <Divider className='control-divider' horizontal>System</Divider>
            <Grid className='status-container'>
                <Grid.Column width={7} className='status-left-container'>
                    <Header className='status-item' size='small'>Status: <span>{SYSTEM_STATUS[status]}</span></Header> 
                    <Header className='status-item' size='small'>Position: <span>{status !== 0 ? '(' + position.x + ', ' + position.y + ')' : 'N/A'}</span></Header> 
                    <Header className='status-item' size='small'>Rotation: <span>{status !== 0 ? rotation + '°' : 'N/A'}</span></Header> 
                    <Header className='status-item' size='small'>Target: <span>{status !== 0 && target.isActive ? '(' + target.x + ', ' + target.y + ')' : 'N/A'}</span></Header> 
                </Grid.Column>
                <Grid.Column width={9} className='status-right-container'>
                    <div className='system-control-item stop-btn' >
                        <Icon name='stop' size='large' />
                    </div>
                    <div className='system-control-item' >
                        <Icon name='file' size='large' />
                    </div>
                    <div className='system-control-item' onClick={saveObstacleConfigurations} >
                        <Icon name='save' size='large' />
                    </div>
                </Grid.Column>
            </Grid>

            <Divider className='control-divider' horizontal>Navigation</Divider>
            {renderObstacles()}

            <Divider className='control-divider' horizontal>Resources</Divider>
            <div className='resources-container'>
                <div className='resource-item' onClick={() => { shell.openExternal(PAPER_URL); }} >
                    <Icon name='book' size='large' />
                </div>
                <div className='resource-item' onClick={() => { shell.openExternal(VIDEO_URL); }}>
                    <Icon name='video' size='large' />
                </div>
                <div className='resource-item' onClick={() => { shell.openExternal(GITHUB_URL); }}>
                    <Icon name='github' size='large' />
                </div>
                <div className='resource-item' onClick={() => { shell.openExternal(WEBSITE_URL); }}>
                    <Icon name='linkify' size='large' />
                </div>
            </div>
        </div>
    )
}

export default ControlPanel;