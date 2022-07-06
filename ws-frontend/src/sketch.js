const SPEED = 0.05;

let = pos = {
  x: 0,
  y: 0,
};

let target = {
  x: 0,
  y: 0,
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  background(0);
  noStroke();
}

function draw() {
  //background(220);
  fill(0, 15);
  rect(0, 0, width, height);
  fill(255);

  circle(pos.x, pos.y, 20);

  pos.x += SPEED * (target.x - pos.x);
  pos.y += SPEED * (target.y - pos.y);
}

function mouseClicked() {
  setTarget(mouseX, mouseY);
  sendTargetToServer();

  console.log("New target is: ");
  console.log(target);
}

function setTarget(tx, ty) {
  target = {
    x: tx,
    y: ty,
  };
}

function sendTargetToServer() {
  let norm = {
    x: target.x / width,
    y: target.y / height,
  };

  let str = JSON.stringify(norm);
  serverConnection.send(str);
}

// WEBSOCKET STUFF
// const serverAddress = "wss://kake-telegram-backend.glitch.me";
const serverAddress = "wss://kake-ws-frontend.edgecompute.app/ws";
const serverConnection = new WebSocket(serverAddress);

serverConnection.onopen = function () {
  console.log("Connected to the server on " + serverAddress);
  // serverConnection.send("Hello server");
};

serverConnection.onmessage = (event) => {
  console.log(event.data);
  if (event.data[0] === "{") {
    let obj = JSON.parse(event.data);
    obj.x *= width;
    obj.y *= height;
    target = obj;
  }
};
