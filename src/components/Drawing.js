import { useState, useRef, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import { featureNormalize } from "../lib/ml";
import Canvas from "./Canvas";

function draw({
  context,
  prev,
  pos,
  isDown = false,
  color = 'black',
  width = 10
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
  root: {
    position: 'relative',
  },
  mainCanvas: {
    zIndex: 10,
    maxWidth: '100%',
    background: 'black',
    touchAction: 'none'
  },
  debugger: {
    position: 'absolute',
    top: 0,
    left: 0,
    visibility: 'hidden',
    color: 'white',
    fontSize: '0.3em',
    zIndex: 1,
    maxWidth: '20em'
  },
  debugOn: {
    visibility: 'visible'
  },
  debugCanvas: {
    border: '1px solid gray',
    background: 'gray'
  },
  inpVec: {
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    fontSize: '0.35rem'
  }
}));

export default function Drawing({ onChange, debug }) {
  const classes = useStyles();
  const [prev, setPrev] = useState({});
  const [isDown, setIsDown] = useState(false);
  const [urlData, setUrlData] = useState('');
  const canvasRef = useRef(null);
  const scaledCanvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [scaledContext, setScaledContext] = useState(null);

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (canvas !== null) {
      const ctx = canvas.getContext('2d');
      setContext(ctx);
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

  useEffect(() => {
    if (!isDown && scaledContext) {
      const { data } = scaledContext.getImageData(0, 0, scaledContext.canvas.width, scaledContext.canvas.height);

      const grayPixels = [];
      for (let i = 0; i < data.length; i+=4) {
        const rgb = (data[i] + data[i + 1] + data[i + 2]) / 3 / 225;
        grayPixels.push(rgb);
      }

      onChange(featureNormalize(grayPixels));
    }
  }, [isDown, onChange, scaledContext, debug])

  const mouseDown = (e) => {
    const { current: canvas } = canvasRef;
    setIsDown(true);
    const pos = { x: e.clientX - canvas.parentElement.offsetLeft, y: e.clientY - canvas.parentElement.offsetTop }
    draw({ context, prev, pos, isDown: false, color: 'white' });
    setPrev(pos);
  }

  const mouseMove = (e) => {
    const { current: canvas } = canvasRef;
    if (isDown) {
      const pos = { x: e.clientX - canvas.parentElement.offsetLeft, y: e.clientY - canvas.parentElement.offsetTop }
      draw({ context, prev, pos, isDown, color: 'white' });
      setUrlData(canvas.toDataURL());
      setPrev(pos);
    }
  }

  const touchStart = (e) => {
    const { current: canvas } = canvasRef;
    const touches = e.changedTouches;
    // e.preventDefault();
    if (touches.length === 1) {
      const [touch, ] = touches;
      const pos = { x: touch.clientX - canvas.parentElement.offsetLeft, y: touch.clientY - canvas.parentElement.offsetTop }
      draw({ context, prev, pos, isDown, color: 'white' });

      setIsDown(true);
      setPrev(pos);
    }
  }

  const touchMove = (e) => {
    const { current: canvas } = canvasRef;
    const touches = e.changedTouches;
    // e.preventDefault();
    if (isDown && touches.length === 1) {
      const [touch, ] = touches;
      const pos = { x: touch.clientX - canvas.parentElement.offsetLeft, y: touch.clientY - canvas.parentElement.offsetTop }
      draw({ context, prev, pos, isDown, color: 'white' });
      setUrlData(canvas.toDataURL());
      setPrev(pos);
    }
  }

  const stopDraw = () => {
    setIsDown(false);
  }

  return (
    <div className={classes.root}>
      <Canvas
        width="400px"
        height="400px"
        id="main"
        ref={canvasRef}
        className={classes.mainCanvas}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseLeave={stopDraw}
        onMouseUp={stopDraw}
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchCancel={stopDraw}
        onTouchEnd={stopDraw}
      >
      </Canvas>
      <div className={`${classes.debugger} ${debug && classes.debugOn}`}>
        <Canvas
          ref={scaledCanvasRef}
          width="20px" height="20px" id="scaled"
          className={classes.debugCanvas}
        />
        <br/>
        <div>
        x: {prev.x} y: {prev.y}
        </div>
        <div>
        offset x: {
          canvasRef.current && canvasRef.current.parentElement.offsetLeft
        } offset y: {
          canvasRef.current && canvasRef.current.parentElement.offsetTop
        }
        </div>
      </div>
    </div>
  )
}