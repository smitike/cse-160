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

function drawPicture() {
  shapesList = [];
  const size = 40;

  shapesList.push(new Triangle([0.0, 0.3], [1.0, 0.0, 0.0], size));
  shapesList.push(new Triangle([0.0, -0.1], [0.0, 0.0, 1.0], size));

  renderAllShapes();
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