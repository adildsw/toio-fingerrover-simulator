import { Divider, Grid, Header, Icon } from 'semantic-ui-react';
import { loadObstaclesFromConfigurations, saveObstacleConfigurations } from '../../utils/Utils';
import SystemStatus from '../../utils/enums/SystemStatus';

import TitleBar from "./TitleBar";
import ObstacleItem from './ObstacleItem';

import './ControlPanel.css';
import { useRef } from 'react';


const { shell } = window.require('electron');

const PAPER_URL = 'https://adildsw.github.io/docs/chi23_fingerrover_preprint.pdf';
const VIDEO_URL = 'https://www.youtube.com/watch?v=bhb8Q3gnuo0';
const GITHUB_URL = 'https://github.com/adildsw/toio-fingerrover-simulator';
const WEBSITE_URL = 'https://ultimateinterface.com';

const ControlPanel = (props) => {
    const { obstacleProps, toioProps, systemProps } = props;
    const { toioStatus, target, stopToio, toioSpeed, setToioSpeed, closeServer } = systemProps;
    const { minToioSpeed, maxToioSpeed } = toioProps;
    const { obstacles, setObstacles } = obstacleProps;

    const fileInputRef = useRef(null);
    
    const renderObstacles = () => {
        let renderedObstacles = [];
        for (let i = 0; i < obstacleProps.obstacleCount; i++) {
            renderedObstacles.push(<ObstacleItem key={i} idx={i} obstacleProps={obstacleProps} toioProps={toioProps} systemProps={systemProps} />);
        }
        return renderedObstacles;
    }

    return (
        <div className='control-panel'>
            <TitleBar closeServer={closeServer} />
            
            <Divider className='control-divider' horizontal>System</Divider>
            <Grid className='status-container'>
                <Grid.Column width={7} className='status-left-container'>
                    <Header className='status-item' size='small'>Status: <span>{SystemStatus[toioStatus.status]}</span></Header> 
                    <Header className='status-item' size='small'>Position: <span>{toioStatus.status !== 0 ? '(' + toioStatus.x + ', ' + toioStatus.y + ')' : 'N/A'}</span></Header> 
                    <Header className='status-item' size='small'>Rotation: <span>{toioStatus.status !== 0 ? toioStatus.angle + '°' : 'N/A'}</span></Header> 
                    <Header className='status-item' size='small'>Target: <span>{toioStatus.status !== 0 && target.isActive ? '(' + target.x + ', ' + target.y + ')' : 'N/A'}</span></Header> 
                </Grid.Column>
                <Grid.Column width={9} className='status-right-container'>
                    <div className='status-right-subcontainer'>
                        <div className='system-control-item reconnect-btn' onClick={() => { window.location.reload(); }}>
                            <Icon name='refresh' size='large' />
                        </div>
                        <div className='system-control-item stop-btn' onClick={stopToio}>
                            <Icon name='stop' size='large' />
                        </div>
                    </div>
                    <div className='speed-slider-body'>
                        <div className='speed-slider-info'>
                            <Header size='small'>Toio Speed: <span>{toioSpeed}</span></Header>
                        </div>

                        <input 
                            type='range' 
                            className='speed-slider-range' 
                            value={toioSpeed}
                            min={minToioSpeed}
                            max={maxToioSpeed}
                            onChange={(e) => { setToioSpeed(e.target.value); }} 
                        />
                    </div>
                </Grid.Column>
            </Grid>

            <Divider className='control-divider' horizontal>Navigation</Divider>
            <div className='obstacle-state-control-container'>
                <div className='obstacle-state-control' onClick={() => { fileInputRef.current.click(); }}>
                    <Icon name='file' size='large' color='grey' />
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => { loadObstaclesFromConfigurations(e.target.files[0], setObstacles); }}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className='obstacle-state-control' onClick={() => { saveObstacleConfigurations(obstacles); }}>
                    <Icon name='save' size='large' color='grey' />
                </div>
            </div>
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