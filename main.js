window.onload = start;

function start() {
    // Width and Height of the whole visualization
    var width = 1250;
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
        .scale(150)
        .rotate([0, 0])
        .center([50, 50])
        .translate([width / 2, height / 2]);

    // Create GeoPath function that uses built-in D3 functionality to turn
    // lat/lon coordinates into screen coordinates
    // var geoPath = d3.geoPath()
    //     .projection(mapProjection);


    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    // g.selectAll("path")
    //     .data(neighborhoods_json.features)
    //     .enter()
    //     .append("path")
    //     .attr("fill", "#ccc")
    //     .attr("stroke", "#333")
    //     .attr("d", geoPath);


    // Load external data and boot
    // Data and color scale
    var data = d3.map();
    var colorScale = d3.scaleThreshold()
        .domain([0, 100, 1000, 10000, 100000, 500000000])
        .range(d3.schemeBlues[7]);

    // Load external data and boot
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "./data/aircraft_incidents.csv", function (d) {

            data.set(d.Country, parseInt(d.Total_Fatal_Injuries + data.get(d.Country)));

            // console.log(d.Country + " " +d.Total_Fatal_Injuries);
        })

        .await(ready);

    function ready(error, topo) {

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(mapProjection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.properties.name) || 0;
                return colorScale(1.3 * d.total);
            });
    }
    console.log(data);



}