/**
 * Author: Marco Garzon Lara
 * Student Number: 33970651
 * Brief: Unintuitive, physics-based volume mixer UI
 * Notes: This JavaScript file is so gross and coupled I apologise in advance to whoever has to read this, I wrote this on the fly lol.
 */

const matterContainer = document.querySelector("#matter-container");
const THICCNESS = 60;

let volume = 0;

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

// create a physics engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: matterContainer,
    engine: engine,
    options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        background: "transparent",
        wireframes: false,
        showAngleIndicator: false
    }
});

//create plinko machine ball collider grid
for (let i = 0; i < 12; ++i) {
  let Offset = 10;
  for(let j = 0; j < 50; ++j) {
    if(i % 2 == 0) { //if row is even then apply an offset. This displays a plinko-like layout
      let circle = Bodies.circle(20 + (j * 50) + Offset, 250 + i * 50, 10, { //create a circle with the x-pos
          isStatic: true,
          friction: 0
      });
      Composite.add(engine.world, circle); //add the collider onto the scene
    } else {
        let circle = Bodies.circle(450 + (j * 50), 250 + i * 50, 10, {
            isStatic: true,
            friction: 0
        });
        Composite.add(engine.world, circle);
    }
  }
}

//Player particle spawner position
var currentPlayerPosition = matterContainer.clientWidth / 2;
let playerCounter = Bodies.rectangle(currentPlayerPosition, 70, 10, 10, {
  isStatic: true
});
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case "ArrowLeft": //left
    currentPlayerPosition += -20;
    break;
    case "ArrowRight": //right
    currentPlayerPosition += 20;
    break;
  }
  Matter.Body.set(playerCounter, "position", { x: currentPlayerPosition, y: 70 });
});
Composite.add(engine.world, playerCounter);

/**
 * Spawns particle when spacebar is pressed.
 */
document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        //create circle
        let circle = Bodies.circle(currentPlayerPosition, 80, 10, {
            friction: 0.3,
            frictionAir: 0.00001,
            restitution: 0.8
        });
        Composite.add(engine.world, circle); //add to physics world
    }
});

var ground = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + THICCNESS / 2,
  27184,
  THICCNESS,
  { isStatic: true }
);

let leftWall = Bodies.rectangle(
  0 - THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  {
    isStatic: true
  }
);

let rightWall = Bodies.rectangle(
  matterContainer.clientWidth + THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  { isStatic: true }
);

// add all of the bodies to the world
Composite.add(engine.world, [ground, leftWall, rightWall]);

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint);

// allow scroll through the canvas
mouseConstraint.mouse.element.removeEventListener(
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function handleResize(matterContainer) {
  // set canvas size to new values
  render.canvas.width = matterContainer.clientWidth;
  render.canvas.height = matterContainer.clientHeight;

  // reposition ground
  Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + THICCNESS / 2
    )
  );

  // reposition right wall
  Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + THICCNESS / 2,
      matterContainer.clientHeight / 2
    )
  );
}

document.getElementById('output').innerHTML = volume;

window.addEventListener("resize", () => handleResize(matterContainer));