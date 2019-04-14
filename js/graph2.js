var width = 1200;
var height = 500;

d3.csv("data/aircraft_incidents.csv", function(csv) {
  for (var i = 0; i < csv.length; i++) {
    csv[i].Total_Fatal_Injuries = Number(csv[i].Total_Fatal_Injuries);
    csv[i].Total_Serious_Injuries = Number(csv[i].Total_Serious_Injuries);
    csv[i].Total_Uninjured = Number(csv[i].Total_Uninjured);
  }
  var groupByMake = d3
    .nest()
    .key(function(d) {
      return d.Make;
    })
    .key(function(d) {
      return d.Model;
    })
    .rollup(function(v) {
      return {
        fatalities: d3.sum(v, function(d) { return d.Total_Fatal_Injuries; }),
        serious: d3.sum(v, function(d) { return d.Total_Serious_Injuries }),
        uninjured: d3.sum(v, function(d) { return d.Total_Uninjured })
      }
    })
    .entries(csv);

  // console.log(groupByMake)
  scaleMaxes = {}
  for (var make = 0; make < groupByMake.length; make++) {
    var models = groupByMake[make].values;
    var maxFatalities = 0;
    var maxSerious = 0;
    var maxUninjured = 0;
    for (var model = 0; model < models.length; model++) {
      maxFatalities = Math.max(maxFatalities, models[model].value.fatalities);
      maxSerious = Math.max(maxSerious, models[model].value.serious);
      maxUninjured = Math.max(maxUninjured, models[model].value.uninjured);
    }
    scaleMaxes[groupByMake[make].key] = {
      maxFatalities: maxFatalities,
      maxSerious: maxSerious,
      maxUninjured: maxUninjured
    }
  }

  console.log(scaleMaxes)

  var margin = {
    top: 36,
    right: 50,
    bottom: 20,
    left: 50
  };
  var labelMargin = 8;
  var starWidth = width / 4 - margin.left - margin.right;
  var starHeight = width / 4 - margin.top - margin.bottom;
  var counter = 0;
  for (var make = 0; make < groupByMake.length; make++) {
    var models = groupByMake[make].values;
    for (var model = 0; model < models.length; model++) {
      console.log(models[model].value);
      var scales = [];
      scales.push(d3.scaleLinear().domain([0, scaleMaxes[groupByMake[make].key].maxFatalities]).range([0, 100]));
      scales.push(d3.scaleLinear().domain([0, scaleMaxes[groupByMake[make].key].maxSerious]).range([0, 100]));
      scales.push(d3.scaleLinear().domain([0, scaleMaxes[groupByMake[make].key].maxUninjured]).range([0, 100]));
      var star = d3
        .starPlot()
        .width(starWidth)
        .properties(Object.keys(models[model].value))
        .scales(scales)
        .title(() => groupByMake[make].key + " " + models[model].key)
        .margin(margin)
        .labelMargin(labelMargin)
        .labels(Object.keys(models[model].value));

      var wrapper = d3.select("#graph2")
        .append("div")
        .attr("class", "wrapper");

      var svg = wrapper.append("svg")
        .attr('class', 'chart')
        .attr('width', starWidth + margin.left + margin.right)
        .attr('height', starWidth + margin.top + margin.bottom);
      
      var starG = svg
        .append("g")
        .datum(models[model].value)
        .call(star)
        .call(star.interaction);

      var interactionLabel = wrapper
        .append("div")
        .attr("class", "interaction label");

      var circle = svg
        .append("circle")
        .attr("class", "interaction circle")
        .attr("r", 5);

      var interaction = wrapper
        .selectAll(".interaction")
        .style("display", "none");

      svg
        .selectAll(".star-interaction")
        .on("mouseover", function(d) {
          svg.selectAll(".star-label").style("display", "none");

          interaction.style("display", "block");

          circle.attr("cx", d.x).attr("cy", d.y);

          $interactionLabel = $(interactionLabel.node());
          interactionLabel
            .text(d.key + ": " + d.datum[d.key])
            .style("left", d.xExtent - $interactionLabel.width() / 2)
            .style("top", d.yExtent - $interactionLabel.height() / 2);
        })
        .on("mouseout", function(d) {
          interaction.style("display", "none");

          svg.selectAll(".star-label").style("display", "block");
        });


      counter++;
    }
  }
});
