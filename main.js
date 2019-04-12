window.onload = start;

function start() {
    // Width and Height of the whole visualization
    var width = 1200;
    var height = 800;

// Create SVG
    var body = document.getElementById('graph');
    var svg = d3.select(body)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

// Append empty placeholder g element to the SVG
// g will contain geometry elements
    var g = svg.append("g");

// Width and Height of the whole visualization
// Set Projection Parameters
    var mapProjection = d3.geoMercator()
        .scale(120)
        .rotate([0, 0])
        .center([50, 50])
        .translate([width / 2, height / 2]);

// Create GeoPath function that uses built-in D3 functionality to turn
// lat/lon coordinates into screen coordinates
    var geoPath = d3.geoPath()
        .projection(mapProjection);


    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll("path")
        .data(neighborhoods_json.features)
        .enter()
        .append("path")
        .attr("fill", "#ccc")
        .attr("stroke", "#333")
        .attr("d", geoPath);
}