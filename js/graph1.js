window.onload = start;

function start() {
  // Width and Height of the whole visualization
  var width = 1250;
  var height = 650;

  // Create SVG
  var body = document.getElementById("graph1");
  var svg = d3
    .select(body)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Append empty placeholder g element to the SVG
  // g will contain geometry elements
  var g = svg.append("g");

  var tooltip = d3
    .select(body)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Width and Height of the whole visualization
  // Set Projection Parameters
  var mapProjection = d3
    .geoMercator()
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
  var colorScale = d3
    .scaleThreshold()
    .domain([0, 1, 20, 50, 100, 200, 300])
    .range(d3.schemeBlues[7]);

  d3.queue()
    .defer(
      d3.json,
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
    .await(ready);

  function ready(error, topo) {
    d3.csv("../data/aircraft_incidents.csv", function(csv) {
      var currentYear = 1995;
      function setData() {
        data = d3.map();
        for (var i = 0; i < csv.length; i++) {
          var currentValue = data.has(csv[i].Country)
            ? parseInt(data.get(csv[i].Country))
            : 0;
          var countryYear = new Date(csv[i].Event_Date).getFullYear();
          var countryValue =
            countryYear == currentYear
              ? parseInt(csv[i].Total_Fatal_Injuries)
              : 0;
          data.set(csv[i].Country, countryValue + currentValue);
        }
      }
      setData();
      // Draw the map
      var countries = svg
        .append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath().projection(mapProjection))
        // set the color of each country
        .attr("fill", function(d) {
          d.total = data.has(d.properties.name)
            ? data.get(d.properties.name)
            : 0;
          return colorScale(d.total);
        })
        .on("mouseover", function(d) {
          tooltip
            .transition()
            .duration(200)
            .attr("transform", "translate(0, 100)")
            .style("opacity", 0.9);
          tooltip
            .html(
              d.properties.name +
                " " +
                (data.has(d.properties.name) ? data.get(d.properties.name) : 0)
            )
            .attr("x", 200)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px");
        })
        .on("mouseout", function(d) {
          tooltip
            .transition()
            .duration(700)
            .style("opacity", 0);
        })
        .style("stroke", "white");

      function setFill() {
        countries.attr("fill", function(d) {
          d.total = data.has(d.properties.name)
            ? data.get(d.properties.name)
            : 0;
          return colorScale(d.total);
        });
      }

      var dataTime = d3.range(0, 22).map(function(d) {
        return new Date(1995 + d, 10, 3);
      });

      var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(width - 200)
        .tickFormat(d3.timeFormat("%Y"))
        .tickValues(dataTime)
        .default(new Date(1995, 10, 3))
        .on("onchange", val => {
          currentYear = val.getFullYear();
          setData();
          setFill();
          console.log(data);
          console.log(currentYear);
        });

      var gTime = d3
        .select("div#slider-time")
        .append("svg")
        .attr("width", width)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

      gTime.call(sliderTime);
    });
  }
}
