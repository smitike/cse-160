let canvas;
let ctx;

function main() {
  canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  ctx = canvas.getContext('2d');
  clearCanvas();
}

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = 20;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + v.elements[0] * scale,
    centerY - v.elements[1] * scale
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent() {
  clearCanvas();

  const x = parseFloat(document.getElementById('v1x').value);
  const y = parseFloat(document.getElementById('v1y').value);

  const v1 = new Vector3([x, y, 0]);
  drawVector(v1, 'red');

  const x2 = parseFloat(document.getElementById('v2x').value);
  const y2 = parseFloat(document.getElementById('v2y').value);

  const v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  clearCanvas();

  const x1 = parseFloat(document.getElementById('v1x').value);
  const y1 = parseFloat(document.getElementById('v1y').value);
  const x2 = parseFloat(document.getElementById('v2x').value);
  const y2 = parseFloat(document.getElementById('v2y').value);
  const scalar = parseFloat(document.getElementById('scalar').value);
  const op = document.getElementById('operation').value;

  const v1 = new Vector3([x1, y1, 0]);
  const v2 = new Vector3([x2, y2, 0]);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (op === 'add') {
    let v3 = new Vector3([x1, y1, 0]);
    v3.add(v2);
    drawVector(v3, 'green');
  } else if (op === 'sub') {
    let v3 = new Vector3([x1, y1, 0]);
    v3.sub(v2);
    drawVector(v3, 'green');
  } else if (op === 'mul') {
    let v3 = new Vector3([x1, y1, 0]);
    let v4 = new Vector3([x2, y2, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'div') {
    let v3 = new Vector3([x1, y1, 0]);
    let v4 = new Vector3([x2, y2, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'magnitude') {
    console.log('Magnitude v1:', v1.magnitude());
    console.log('Magnitude v2:', v2.magnitude());
  } else if (op === 'normalize') {
    let v3 = new Vector3([x1, y1, 0]);
    let v4 = new Vector3([x2, y2, 0]);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'angle') {
    console.log('Angle:', angleBetween(v1, v2));
  } else if (op === 'area') {
    console.log('Area of the triangle:', areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();

  let cosAlpha = dot / (mag1 * mag2);
  cosAlpha = Math.max(-1, Math.min(1, cosAlpha));

  let angleRadians = Math.acos(cosAlpha);
  let angleDegrees = angleRadians * 180 / Math.PI;

  return angleDegrees;
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let areaParallelogram = cross.magnitude();
  return areaParallelogram / 2;
}
