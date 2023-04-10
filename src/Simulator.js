import { useState } from "react";
import useImage from 'use-image';
import { Stage, Layer, Circle, Image } from 'react-konva';
import { Icon } from "semantic-ui-react";
import './Simulator.css'



const Simulator = (props) => {
    const { mouseProps } = props;

    const width = 580;
    const height = 580;

    const [matImg] = useImage('./assets/toio_collection_front.png');
    const [matAltImg] = useImage('./assets/toio_collection_back.png');
    const [isAltMat, setIsAltMat] = useState(false);

    return (
        <div className="simulator">
            <Stage width={width} height={height}>
                <Layer>
                    <Image
                        image={isAltMat ? matAltImg : matImg}
                        width={width}
                        height={height}
                        onMouseMove={(e) => { mouseProps.setMousePos({ x: e.evt.offsetX, y: e.evt.offsetY }); }}
                        onMouseEnter={() => { mouseProps.setIsMouseOver(true); }}
                        onMouseLeave={() => { mouseProps.setIsMouseOver(false); }}
                    />
                    { mouseProps.isMouseOver && <Circle fillEnabled={false} stroke='grey' strokeWidth={2} radius={10} x={mouseProps.mousePos.x} y={mouseProps.mousePos.y} /> }
                </Layer>
            </Stage>
            <Icon className='alt-mat-btn' circular name={"circle" + (isAltMat ? " outline" : "")} onClick={() => { setIsAltMat(!isAltMat); }} />
        </div>
    );
}

export default Simulator;