import { Icon } from 'semantic-ui-react';
import './TitleBar.css'

const TitleBar = (props) => {
    const { closeServer } = props;
    return (
        <div className='titlebar'>
            <span className='title'>toio fingerrover simulator v1.0</span>
            <Icon className='close-btn' name='close' onClick={() => { 
                closeServer();
                window.close(); 
            }} />
        </div>
    );
}

export default TitleBar;