import { Button } from "@material-ui/core";
import { useState, useRef, useEffect } from "react";
import { PNG } from "pngjs";
import { makeStyles } from '@material-ui/core/styles';

import Canvas from "./Canvas";

function draw({
  context,
  prev,
  pos,
  isDown = false,
  color = 'black',
  width = 15
}) {
  if (isDown) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineJoin = "round";
    context.moveTo(prev.x, prev.y);
    context.lineTo(pos.x, pos.y);
    context.closePath();
    context.stroke();
  }
}

const useStyles = makeStyles(theme => ({
  scaledCanvas: {
    position: 'absolute',
    visibility: 'hidden'
  },
  clear: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  btns: {
    '& > *': {
      margin: theme.spacing(1),
    },
  }
}));

export default function Drawing({ onClear, onChange, onAction }) {
  const classes = useStyles();
  const [prev, setPrev] = useState({});
  const [isDown, setIsDown] = useState(false);
  const [urlData, setUrlData] = useState('');
  const canvasRef = useRef(null);
  const scaledCanvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [scaledContext, setScaledContext] = useState(null);
  const debug = false;

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (canvas !== null) {
      setContext(canvas.getContext('2d'));
    }
    const { current: scaledCanvas } = scaledCanvasRef;
    if (scaledCanvas !== null) {
      setScaledContext(scaledCanvas.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    const img = new Image();
    const { current: canvas } = scaledCanvasRef;
    img.onload = function () {
      scaledContext.drawImage(this, 0, 0, canvas.width, canvas.height);
    };
    img.src = urlData;
  }, [urlData, scaledContext])

  const mouseDown = (e) => {
    const { current: canvas } = canvasRef;
    setIsDown(true);
    const pos = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }
    draw({ context, prev, pos, isDown: false });
    setPrev(pos);
  }

  const mouseMove = (e) => {
    const { current: canvas } = canvasRef;
    if (isDown) {
      const pos = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }
      draw({ context, prev, pos, isDown });
      setUrlData(canvas.toDataURL());
      setPrev(pos);
    }
  }


  const mouseUp = (e) => {
    setIsDown(false);
  }

  const mouseLeave = (e) => {
    setIsDown(false);
  }

  const clearCanvas = () => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    scaledContext.setTransform(1, 0, 0, 1, 0, 0);
    scaledContext.clearRect(0, 0, scaledContext.canvas.width, scaledContext.canvas.height);
    onClear();
  }

  useEffect(() => {
    if (!isDown) {
      const png = new PNG({ width: 20, height: 20,  colorType: 0 })
      const { current: canvas } = scaledCanvasRef;

      canvas.toBlob(blob => {
        blob.arrayBuffer().then(buff => {
          png.parse(buff,(err, data) => {
            const greyBits = [];
            for (let i = 0; i < 20 * 20; i++) {
              greyBits.push(data.data[i * 4 + 3] / 255);
            }
            onChange(greyBits);
          })
        })
      })
    }
  }, [isDown, onChange])

  const doAction = () => {
    onAction()
  }

  return (
    <div>
      <Canvas
        width="400px"
        height="400px"
        id="main"
        ref={canvasRef}
        className={classes.mainCanvas}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseMove={mouseMove}
        onMouseLeave={mouseLeave}
      >
      </Canvas>
      <Canvas ref={scaledCanvasRef} width="20px" height="20px" id="scaled" className={!debug && classes.scaledCanvas} />
      <div className={classes.btns}>
        <Button onClick={doAction} variant="contained" color="primary">Check</Button>
        <Button onClick={clearCanvas} variant="contained" color="secondary">Clear</Button>
      </div>
    </div>
  )
}