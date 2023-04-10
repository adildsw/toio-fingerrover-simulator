import { Grid } from 'semantic-ui-react';
import './App.css';
import Simulator from './Simulator';
import ControlPanel from './ControlPanel';
import { useState } from 'react';

const App = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseOver, setIsMouseOver] = useState(false);

  const mouseProps = { mousePos, setMousePos, isMouseOver, setIsMouseOver };

  return (
    <Grid className={'parent-grid'}>
      <Grid.Column className={'simulator-grid'} width={11}>
        <Simulator mouseProps={mouseProps} />
      </Grid.Column>
      <Grid.Column className={'control-panel-grid'} width={5}>
        <ControlPanel mouseProps={mouseProps} />
      </Grid.Column>
    </Grid>
  );
}

export default App;
