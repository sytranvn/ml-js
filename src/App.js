import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Container, Typography, AppBar, IconButton, Button, Select, MenuItem, Tooltip, Input} from "@material-ui/core";
import BugReportIcon from '@material-ui/icons/BugReport';
import EditIcon from '@material-ui/icons/Edit';


import { csvToMatrix, findIndexMax, predict } from "./lib/ml";
import { CustomMenuContext } from "./components/CustomMenu";
import Drawing from "./components/Drawing";


const useStyles = makeStyles(theme => ({
  predictions: {
    display: 'flex',
    flexDirection: 'column'
  },
  prediction: {
    padding: '0.3em 0'
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
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  btns: {
    '& > *': {
      margin: theme.spacing(0.25),
    },
  }
}));

function App() {
  const classes = useStyles();
  const [theta1, setTheta1] = useState(null);
  const [theta2, setTheta2] = useState(null);
  const [pixels, setPixels] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [maxPrediction, setMaxPrediction] = useState(null);
  const [debug, setDebug] = useState(false);
  const [model, setModel] = useState('backprop');
  const [key, setKey] = useState(new Date().toISOString());
  const [data, setData] = useState([]);
  const [label, setLabel] = useState(10);
  const [editting, setEditting] = useState(false);
  const [hasPixel, setHasPixel] = useState(false);

  useEffect(() => {
    fetch(`/weights/${model}-weights-1.csv`, { dataType: 'text' })
    .then(r => r.text())
    .then(csvToMatrix)
    .then(setTheta1);

    fetch(`/weights/${model}-weights-2.csv`, { dataType: 'text' })
    .then(r => r.text())
    .then(csvToMatrix)
    .then(setTheta2)
  }, [model])

  useEffect(() => {
    if (editting) {
      for (let i = 0; i < pixels.length; i++) {
        if (pixels[i] !== 0) {
          setHasPixel(true);
          return;
        }
      }
    }
  }, [editting, pixels, setHasPixel]);

  const clearCanvas = () => {
    setKey(new Date().toISOString());
    setPixels([]);
    setHasPixel(false);
    setPredictions([]);
  }

  const getPrediction = () => {
    if (pixels.length) {
      const [predictions] = predict(pixels, [theta1, theta2]).toArray();
      setPredictions(predictions);
      setMaxPrediction(findIndexMax(predictions));
    }
  }

  const selectModel = e => {
    setModel(e.target.value);
  }

  const toggleDebug = () => {
    setDebug(debug => !debug);
  }

  const toggleEdit = () => {
    setEditting(editting => !editting);
  }

  const changeLabel = (e) => {
    setLabel(e.target.value);
  }

  const addData = () => {
    const newData = [...data];
    newData.push([...pixels, label]);
    setData(newData);
    clearCanvas();
  }

  const exportData = async () => {
    const csv = data.map(row => row.join(",")).join("\n");
    const fileHandle = await window.showSaveFilePicker();
    const stream = fileHandle.createWritable();
    await stream.write(csv);
    await stream.close();
  }

  return (
    <CustomMenuContext.Provider value={{ hidden: !debug, toggleMenu: toggleDebug }}>
      <AppBar position="static">
        <Typography variant="h6" className={classes.title}>
          Draw a number
        </Typography>
      </AppBar>
      <Container maxWidth="sm" className={classes.app}>
        <div>
          <Drawing
            key={key}
            onChange={setPixels}
            debug={debug}
          />
          <div className={classes.btns}>
            <Select labelId="model" id="model" onChange={selectModel} value={model}>
              <MenuItem value="backprop">Backpropagation</MenuItem>
            </Select>
            <Button onClick={getPrediction} disabled={hasPixel} variant="contained" color="primary">Check</Button>
            <Button onClick={clearCanvas} variant="contained" color="secondary">Clear</Button>
            <Tooltip title={debug? 'On': 'Off'}>
            <IconButton aria-label="debug" color={debug ? "primary" : "default" } onClick={toggleDebug}>
              <BugReportIcon />
            </IconButton>
            </Tooltip>
            <IconButton aria-label="edit" color={editting ? "primary" : "default"} onClick={toggleEdit}>
              <EditIcon />
            </IconButton>
          </div>
          {
            editting && <>
              <Input value={label} type="number" min={1} max={10} onChange={changeLabel} />
              <Button onClick={addData} disabled={!hasPixel} color="secondary">Add</Button>
              <Button onClick={exportData} color="primary">Export ({data.length})</Button>
            </>
          }
        </div>
        <div>
          <Typography variant="h6">
            Guesses
          </Typography>
        {predictions.length > 0 && (
            <div className={`${classes.predictions} ${predictions[maxPrediction] >= 0.5 ? classes.confident : ''}`}>
              {(maxPrediction + 1) % 10} : {(predictions[maxPrediction] * 100).toFixed(2)}%
            </div>
        )}
        </div>
        </Container>
    </CustomMenuContext.Provider>
  );
}

export default App;
