import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Container, Typography, AppBar } from "@material-ui/core";
import { csvToMatrix, predict } from "./lib/ml";

import { CustomMenuContext } from "./components/CustomMenu";
import Drawing from "./components/Drawing";


const useStyles = makeStyles(theme => ({
  predictions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  prediction: {
    padding: '1em'
  },
  confident: {
    color: 'green',
    fontWeight: 'bold'
  },
  title: {
    flexGrow: 1,
    margin: theme.spacing(2),
  },
  app: {
    paddingTop: theme.spacing(1),
  }
}));

function App() {
  const classes = useStyles();
  const [theta1, setTheta1] = useState(null);
  const [theta2, setTheta2] = useState(null);
  const [bits, setBits] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    fetch('/weights/weights-1.csv', { dataType: 'text' })
    .then(r => r.text())
    .then(csvToMatrix)
    .then(setTheta1);

    fetch('/weights/weights-2.csv', { dataType: 'text' })
    .then(r => r.text())
    .then(csvToMatrix)
    .then(setTheta2)
  }, [])

  const clearCanvas = () => {
    setBits([]);
    setPredictions([]);
  }

  const getPrediction = () => {
    if (bits.length) {
      const [predictions] = predict(bits, [theta1, theta2]).toArray();
      setPredictions(predictions);
    }
  }

  const toggleDebug = () => {
    setDebug(debug => !debug);
  }

  return (
    <CustomMenuContext.Provider value={{ hidden: !debug, toggleMenu: toggleDebug }}>
      <AppBar position="static">
        <Typography variant="h6" className={classes.title}>
          Draw a number
        </Typography>
      </AppBar>
      <Container maxWidth="sm" className={classes.app}>
        <Drawing
          onClear={clearCanvas}
          onChange={setBits}
          onAction={getPrediction}
        />
        {predictions.length > 0 && (
          <>
            <Typography variant="h6">
            Guesses
            </Typography>
            <div className={classes.predictions}>
              {predictions.map((value, key) => (<span key={key + 1} className={`${classes.prediction} ${value > 0.5 && classes.confident}`}>
                {(key + 1) % 10}: {value.toFixed(2)}
              </span>))}
            </div>

            <div>
              {/* {debug && <>
                x: {prev.x}
                y: {prev.y}
                <br/>
                offset x: {canvasRef.current && canvasRef.current.offsetLeft}
                offset y: {canvasRef.current && canvasRef.current.offsetTop}
              </>} */}
            </div>
          </>
        )}
        </Container>
    </CustomMenuContext.Provider>
  );
}

export default App;
