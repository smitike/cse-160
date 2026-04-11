let canvas, gl;
let a_Position, u_FragColor, u_Size;

let shapesList = [];
let currentColor = [1, 1, 1];
let currentSize = 10;
let currentType = "point";
let currentSegments = 10;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

class Point {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
  }

  render() {
    let [x, y] = this.position;
    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, x, y, 0.0);
    gl.uniform4f(u_FragColor, ...this.color, 1.0);
    gl.uniform1f(u_Size, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
  }

  render() {
    let [x, y] = this.position;
    let d = this.size / 200;

    let vertices = new Float32Array([
      x, y + d,
      x - d, y - d,
      x + d, y - d
    ]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, ...this.color, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

class Circle {
  constructor(position, color, size, segments) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.segments = segments;
  }

  render() {
    let [x, y] = this.position;
    let d = this.size / 200;
    let angleStep = 360 / this.segments;

    for (let i = 0; i < this.segments; i++) {
      let angle1 = i * angleStep;
      let angle2 = (i + 1) * angleStep;

      let x1 = x + d * Math.cos(angle1 * Math.PI / 180);
      let y1 = y + d * Math.sin(angle1 * Math.PI / 180);

      let x2 = x + d * Math.cos(angle2 * Math.PI / 180);
      let y2 = y + d * Math.sin(angle2 * Math.PI / 180);

      let vertices = new Float32Array([
        x, y,
        x1, y1,
        x2, y2
      ]);

      let buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

      gl.uniform4f(u_FragColor, ...this.color, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
}

function convertCoordinatesEventToGL(ev) {
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let shape;

  if (currentType === "point") {
    shape = new Point([x, y], [...currentColor], Number(currentSize));
  } else if (currentType === "triangle") {
    shape = new Triangle([x, y], [...currentColor], Number(currentSize));
  } else {
    shape = new Circle([x, y], [...currentColor], Number(currentSize), Number(currentSegments));
  }

  shapesList.push(shape);
  renderAllShapes();
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let shape of shapesList) {
    shape.render();
  }
}

function clearCanvas() {
  shapesList = [];
  renderAllShapes();
}

function drawCustomTriangle(vertices, color) {
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.uniform4f(u_FragColor, color[0], color[1], color[2], 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  let sColor = [0.25, 0.65, 0.95];
  let mColor = [0.95, 0.35, 0.7];

  // S
  // top row
  drawCustomTriangle([-0.74, 0.58, -0.56, 0.44, -0.38, 0.58], sColor);
  drawCustomTriangle([-0.38, 0.58, -0.20, 0.44, -0.20, 0.58], sColor);

  // upper-left bend
  drawCustomTriangle([-0.70, 0.20, -0.58, 0.38, -0.46, 0.20], sColor);
  drawCustomTriangle([-0.70, 0.20, -0.46, 0.20, -0.58, 0.02], sColor);

  // center bar / connector
  drawCustomTriangle([-0.58, 0.02, -0.40, 0.12, -0.28, 0.00], sColor);
  drawCustomTriangle([-0.58, 0.02, -0.28, 0.00, -0.40, -0.10], sColor);

  // right bend
  drawCustomTriangle([-0.30, -0.02, -0.12, 0.08, -0.02, -0.10], sColor);
  drawCustomTriangle([-0.30, -0.02, -0.02, -0.10, -0.14, -0.30], sColor);

  // lower-left return
  drawCustomTriangle([-0.46, -0.28, -0.28, -0.18, -0.16, -0.32], sColor);
  drawCustomTriangle([-0.46, -0.28, -0.16, -0.32, -0.30, -0.46], sColor);

  // bottom row
  drawCustomTriangle([-0.74, -0.58, -0.56, -0.44, -0.38, -0.58], sColor);
  drawCustomTriangle([-0.38, -0.58, -0.20, -0.44, -0.20, -0.58], sColor);

  // M top row
  drawCustomTriangle([0.05, 0.55, 0.25, 0.55, 0.15, 0.30], mColor);
  drawCustomTriangle([0.25, 0.55, 0.45, 0.55, 0.35, 0.30], mColor);
  drawCustomTriangle([0.45, 0.55, 0.65, 0.55, 0.55, 0.30], mColor);

  // left column
  drawCustomTriangle([0.15, 0.30, 0.25, 0.05, 0.05, 0.05], mColor);
  drawCustomTriangle([0.05, 0.05, 0.25, 0.05, 0.15, -0.20], mColor);
  drawCustomTriangle([0.15, -0.20, 0.25, -0.45, 0.05, -0.45], mColor);

  // right column
  drawCustomTriangle([0.55, 0.30, 0.65, 0.05, 0.45, 0.05], mColor);
  drawCustomTriangle([0.45, 0.05, 0.65, 0.05, 0.55, -0.20], mColor);
  drawCustomTriangle([0.55, -0.20, 0.65, -0.45, 0.45, -0.45], mColor);

  // center hanging part
  drawCustomTriangle([0.30, 0.30, 0.42, 0.30, 0.36, 0.10], mColor);
  drawCustomTriangle([0.28, 0.10, 0.44, 0.10, 0.36, -0.10], mColor);
  drawCustomTriangle([0.31, -0.10, 0.41, -0.10, 0.36, -0.28], mColor);
}

function updateEnemy() {
  let speed = 0.01;

  enemyPos[0] += (playerPos[0] - enemyPos[0]) * speed;
  enemyPos[1] += (playerPos[1] - enemyPos[1]) * speed;
}

let isMouseDown = false;

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  canvas.onpointerdown = function(ev) {
    isMouseDown = true;
    canvas.setPointerCapture(ev.pointerId);
    click(ev);
  };

  canvas.onpointermove = function(ev) {
    if (isMouseDown) {
      click(ev);
    }
  };

  canvas.onpointerup = function(ev) {
    isMouseDown = false;
    canvas.releasePointerCapture(ev.pointerId);
  };

  canvas.onpointercancel = function(ev) {
    isMouseDown = false;
    canvas.releasePointerCapture(ev.pointerId);
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}