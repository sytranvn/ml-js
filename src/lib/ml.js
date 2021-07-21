import { matrix, exp, subtract, concat, transpose, ones, multiply } from 'mathjs';
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
  let x = matrix([input]);
  for (let i = 0; i < thetas.length; i++) {
    m = x.size()[0];
    x = concat(ones(m, 1), x);
    x = sigmoid(multiply(x, transpose(thetas[i])));
  }

  return x;
}