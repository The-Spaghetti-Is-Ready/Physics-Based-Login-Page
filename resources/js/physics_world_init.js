//This file initializes the physics world for the page

const matterContainer = document.querySelector("#matter-container"); //grab the container div
var THICCNESS = 60;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        background: "transparent",
        wireframes: true,
        showAngleIndicator: true
    }
});

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB]);

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


// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);