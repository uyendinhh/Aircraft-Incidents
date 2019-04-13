var width = 750;
var height = 500;

d3.csv("data/aircraft_incidents.csv", function(csv) {
  for (var i = 0; i < csv.length; i++) {
    csv[i].Total_Fatal_Injuries = Number(csv[i].Total_Fatal_Injuries);
  }
  var groupByPhase = d3
    .nest()
    .key(function(d) {
      return d.Broad_Phase_of_Flight;
    })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.Total_Fatal_Injuries;
      });
    })
    .entries(csv);

  var phaseInjuries = {};

  var phases = [
    "STANDING",
    "TAXI",
    "TAKEOFF",
    "CLIMB",
    "CRUISE",
    "MANEUVERING",
    "DESCENT",
    "APPROACH",
    "GO-AROUND",
    "LANDING"
  ];

  for (var i = 0; i < groupByPhase.length; i++) {
    if (phases.includes(groupByPhase[i].key)) {
      phaseInjuries[groupByPhase[i].key] = groupByPhase[i].value;
    }
  }

  console.log(phaseInjuries);
  console.log(phases);
  var chart = d3.select("graph3");

  var graphic = d3
    .select("#graph3_graphic")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var planeWidth = 100;
  var planeHeight = 100;
  var planeXScale = d3
    .scaleLinear()
    .domain([0, 9])
    .range([0, width - planeWidth]);

  var planeYScale = d3
    .scaleLinear()
    .domain([0, 9])
    .range([height - planeHeight, 0]);

  var background = graphic
    .append("image")
    .attr("xlink:href", "../assets/background.png")
    .attr("x", 0)
    .attr("y", -500)
    .attr("width", width)
    .attr("height", height * 2)

  var plane = graphic
    .append("image")
    .attr("xlink:href", "../assets/plane.svg")
    .attr("width", planeWidth)
    .attr("height", planeHeight)
    .attr("x", planeXScale(0))
    .attr("y", planeYScale(0));

  var graphicText = graphic
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height / 10)
    .attr("font-size", "20px")
    .text(phases[0] + " - " + phaseInjuries[phases[0]] + " Total Fatalities");

  console.log(plane);
  var planeYValues = [
    planeYScale(0),
    planeYScale(0),
    planeYScale(2),
    planeYScale(5),
    planeYScale(8),
    planeYScale(6),
    planeYScale(4),
    planeYScale(2),
    planeYScale(3),
    planeYScale(0)
  ];

  var backgroundValues = [
    -500,
    -500,
    -500,
    0,
    0,
    0,
    -500,
    -500,
    -500,
    -500
  ]

  var data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var sliderStep = d3
    .sliderBottom()
    .min(d3.min(data))
    .max(d3.max(data))
    .width(width - 50)
    .ticks(10)
    .step(1)
    .default(0)
    .on("onchange", val => {
      graphicText.text(phases[val] + " - " + phaseInjuries[phases[val]] + " Total Fatalities");
      plane
        .transition()
        .attr("x", planeXScale(val))
        .attr("y", planeYValues[val]);
      background
        .transition()
        .duration(500)
        .attr("x", 0)
        .attr("y", backgroundValues[val]);
    });

  var gStep = d3
    .select("div#slider-step")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gStep.call(sliderStep);

  
  gStep.selectAll(".tick")
    .selectAll("text")
    .remove();
  gStep.select(".parameter-value")
    .select("text")
    .remove();
});
