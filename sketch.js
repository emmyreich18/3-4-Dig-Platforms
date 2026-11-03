// Coffee data sketch
// Each drink is drawn as a cup seen from above.
//   coffee -> color of the coffee in the cup
//   milk   -> color of the foam ring (no ring = no milk)
//   flavor -> shape floating in the middle (no shape = no flavor)
//   size   -> diameter of the cup
//   order in the JSON -> position (left to right, top to bottom)

let drinks = [];

// ---------- encodings ----------
const COFFEE_COLORS = {
  "espresso":   "#2b1810",
  "cold brew":  "#4a2a17",
  "americano":  "#6e4024",
  "cappuccino": "#94603a",
  "latte":      "#b98457"
};

const MILK_COLORS = {
  "whole":  "#fffaf0",
  "oat":    "#e3c88f",
  "almond": "#f2b8a0",
  "none":   null
};

const FLAVOR_SHAPES = {
  "vanilla": { shape: "circle",   color: "#f7e7a1" },
  "caramel": { shape: "triangle", color: "#e08a2c" },
  "mocha":   { shape: "square",   color: "#5b2d1f" },
  "none":    null
};

const SIZES = {
  "small":  70,
  "medium": 100,
  "large":  130
};

// ---------- layout ----------
const CANVAS_W = 1000;
const CANVAS_H = 640;
const PLOT_W = 680;   // left side holds the cups, right side holds the legend
const COLS = 4;
const CELL_W = PLOT_W / COLS;
const CELL_H = 190;
const TOP = 90;

async function setup() {
  const c = createCanvas(CANVAS_W, CANVAS_H);
  c.parent("sketch");
  const data = await loadJSON("data.json");
  drinks = data.drinks;
  textFont("Georgia");
}

function draw() {
  background("#dfe6e4");

  // title
  noStroke();
  fill("#2b1810");
  textAlign(LEFT, BASELINE);
  textSize(26);
  text("My coffee orders", 30, 45);
  textSize(13);
  fill("#5a4a40");
  text(drinks.length + " drinks, in the order I bought them", 30, 66);

  // cups
  for (let i = 0; i < drinks.length; i++) {
    const col = i % COLS;
    const row = floor(i / COLS);
    const x = col * CELL_W + CELL_W / 2;
    const y = TOP + row * CELL_H + CELL_H / 2;
    drawCup(drinks[i], x, y, i + 1);
  }

  drawLegend(PLOT_W + 20, 30);
}

// ---------- one cup ----------
function drawCup(d, x, y, num) {
  const coffee = clean(d.coffee);
  const milk = clean(d.milk);
  const flavor = clean(d.flavor);
  const size = clean(d.size);

  const dia = SIZES[size] || 90;

  push();
  translate(x, y);

  // saucer
  noStroke();
  fill(255, 255, 255, 140);
  circle(0, 0, dia + 34);

  // handle
  stroke("#f8f8f6");
  strokeWeight(9);
  noFill();
  arc(dia / 2 + 2, 0, 26, 30, -HALF_PI, HALF_PI);

  // cup rim
  noStroke();
  fill("#f8f8f6");
  circle(0, 0, dia + 10);

  // coffee
  fill(COFFEE_COLORS[coffee] || "#888888");
  circle(0, 0, dia);

  // milk foam ring
  const milkColor = MILK_COLORS[milk];
  if (milkColor) {
    noFill();
    stroke(milkColor);
    strokeWeight(dia * 0.14);
    circle(0, 0, dia * 0.62);
  }

  // flavor shape
  const f = FLAVOR_SHAPES[flavor];
  if (f) {
    drawFlavorShape(f.shape, f.color, dia * 0.22);
  }

  pop();

  // label
  noStroke();
  fill("#5a4a40");
  textAlign(CENTER, TOP);
  textSize(12);
  text("#" + num + " " + coffee, x, y + 90);
}

function drawFlavorShape(shape, col, s) {
  fill(col);
  stroke("#ffffff");
  strokeWeight(2);
  if (shape === "circle") {
    circle(0, 0, s);
  } else if (shape === "square") {
    rectMode(CENTER);
    rect(0, 0, s * 0.9, s * 0.9);
  } else if (shape === "triangle") {
    const h = s * 0.55;
    triangle(0, -h, -h, h * 0.8, h, h * 0.8);
  }
}

// ---------- legend ----------
function drawLegend(x, y) {
  push();
  translate(x, y);

  // panel
  noStroke();
  fill(255, 255, 255, 170);
  rect(0, 0, 280, 580, 10);

  fill("#2b1810");
  textAlign(LEFT, CENTER);
  textSize(18);
  text("How to read it", 20, 28);

  let ly = 65;

  // coffee colors
  legendHeading("Coffee = color in the cup", 20, ly);
  ly += 24;
  for (const name in COFFEE_COLORS) {
    noStroke();
    fill(COFFEE_COLORS[name]);
    circle(32, ly, 18);
    legendLabel(name, 52, ly);
    ly += 24;
  }

  // milk ring
  ly += 10;
  legendHeading("Milk = foam ring", 20, ly);
  ly += 26;
  for (const name in MILK_COLORS) {
    noStroke();
    fill("#6e4024");
    circle(32, ly, 24);
    if (MILK_COLORS[name]) {
      noFill();
      stroke(MILK_COLORS[name]);
      strokeWeight(4);
      circle(32, ly, 14);
    }
    legendLabel(name === "none" ? "no milk (no ring)" : name, 52, ly);
    ly += 28;
  }

  // flavor shapes
  ly += 6;
  legendHeading("Flavor = shape in the middle", 20, ly);
  ly += 26;
  for (const name in FLAVOR_SHAPES) {
    const f = FLAVOR_SHAPES[name];
    push();
    translate(32, ly);
    if (f) {
      drawFlavorShape(f.shape, f.color, 18);
    } else {
      noFill();
      stroke("#9a8f86");
      strokeWeight(1);
      drawingContext.setLineDash([3, 3]);
      circle(0, 0, 16);
      drawingContext.setLineDash([]);
    }
    pop();
    legendLabel(name === "none" ? "no flavor (no shape)" : name, 52, ly);
    ly += 26;
  }

  // size
  ly += 6;
  legendHeading("Size = how big the cup is", 20, ly);
  ly += 40;
  let sx = 40;
  for (const name in SIZES) {
    const s = SIZES[name] * 0.35;
    noStroke();
    fill("#b98457");
    circle(sx, ly, s);
    fill("#5a4a40");
    textAlign(CENTER, TOP);
    textSize(11);
    text(name, sx, ly + 28);
    sx += 70;
  }

  pop();
}

function legendHeading(t, x, y) {
  noStroke();
  fill("#2b1810");
  textAlign(LEFT, CENTER);
  textSize(13);
  textStyle(BOLD);
  text(t, x, y);
  textStyle(NORMAL);
}

function legendLabel(t, x, y) {
  noStroke();
  fill("#5a4a40");
  textAlign(LEFT, CENTER);
  textSize(12);
  text(t, x, y);
}

// makes "Oat Milk " and "oat" match the same key
function clean(v) {
  return String(v || "none").trim().toLowerCase();
}