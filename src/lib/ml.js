import { matrix, exp, subtract, concat, transpose, ones, multiply, mean, std, reshape } from 'mathjs';
import { parse as parseCsv } from 'fast-csv';

export async function csvArray(csv) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = parseCsv({ headers: false})
      .on('error', error => { console.error(error); reject(); })
      .on('data', row => rows.push(row))
      .on('end', (rowCount) => {
        console.log(`Parsed ${rowCount} rows`);
        resolve(rows);
      });
    stream.write(csv);
    stream.end();
  });
}

export async function arrayToMatrix(rows) {
  const t = [];
  for (let i = 0; i < rows.length; i++) {
    t.push([]);
    for (let j = 0; j < rows[i].length; j++) {
      t[i].push(+rows[i][j]);
    }
  }
  const mt = matrix(t);
  console.log("Converted ", mt.size());
  return mt;
}

export async function csvToMatrix(csv) {
  const rows = await csvArray(csv);
  return await arrayToMatrix(rows);
}

export function sigmoid(matrix) {
  return matrix.map(z => 1 / ( 1 + exp(-z)));
}

export function gradientSigmoid(matrix) {
  return sigmoid(matrix).dotMultiply(subtract(1, sigmoid(matrix)));
}

export function predict(input, thetas) {
  let m;
  let x = matrix(reshape(transpose(reshape(input, [20, 20])), [1, input.length]));
  for (let i = 0; i < thetas.length; i++) {
    m = x.size()[0];
    x = concat(ones(m, 1), x);
    x = sigmoid(multiply(x, transpose(thetas[i])));
  }

  return x;
}

export function featureNormalize(x) {
  const mu = mean(x);
  const sigma = std(x);

  return x.map(v => (v - mu) / sigma);
}

export function table(x, [row, col]) {
  let tb = '';
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      const v = x[i * col + j];
      tb += v > 0 ? v.toFixed(2) : "    ";
      tb += " ";
    }
    tb += "\n";
  }
  return tb;
}

export function findIndexMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}