function heatColor(t) {

  var g1 = d3.scaleLinear()
    .domain([0, 2])
    .range(["blue", "#04f"]);

  var g2 = d3.scaleLinear()
    .domain([2,4])
    .range(["#04f", "#2a3"]);

  var g3 = d3.scaleLinear()
    .domain([4,6])
    .range(['#2a3','#ee6']) //ee6

  var g4 = d3.scaleLinear()
    .domain([6,8])
    .range(['#ee6', '#fc5']); //fc5

  var g5 = d3.scaleLinear()
    .domain([8,10])
    .range(["#fc5", "#e60"]) //e60

  var g6 = d3.scaleLinear()
    .domain([10,12])
    .range(['#e60', 'red']);

  if (t <= 0) return "blue";
  if (t <= 2) return g1(t);
  if (t <= 4) return g2(t);
  if (t <= 6) return g3(t);
  if (t <= 8) return g4(t);
  if (t <= 10) return g5(t);
  if (t <= 12) return g6(t);
  return "red";

}

var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];

var keyData = [];
for (var i = 0; i < 13; i++) keyData.push(i);

var margin = {top: 40, right: 20, bottom: 50, left: 80};
var width = 1000 - margin.left - margin.right; // base number needs to match wrapper
var height = 600 - margin.top - margin.bottom;
var keyHeight = 60;
var keyCellHeight = 20;
var keyTopMargin = 15;

var x = d3.scaleLinear()
  .range([0,width]);

var y = d3.scaleLinear()
  .range([0, height]);

var y2 = d3.scaleTime()
  .range([0,height])
  .domain([new Date(2016,11,10), new Date(2017,11,10)]);

var chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var keys = d3.select(".keys")
  .attr("width", width + margin.left + margin.right)
  .attr("height", keyHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + keyTopMargin + ")");

var keyCells = keys.selectAll("g")
  .data(keyData)
  .enter().append("g");

var keyCellWidth = width/(keyData.length * 2);

keyCells.append("rect")
  .attr("width", keyCellWidth)
  .attr("height", keyCellHeight)
  .attr("x", function(d,i) {return width/2 + i * keyCellWidth})
  .style("fill", function(d) {return heatColor(Math.floor(d))})

keyCells.append("text")
  .style("fill", "#eee")
  .style("font", "10px sans-serif")
  .attr("x", function(d,i) {return width/2 + (i + 0.5) *keyCellWidth })
  .attr("y", keyCellHeight + keyTopMargin)
  .attr("width", keyCellWidth)
  .attr("text-anchor", "middle")
  .text(function(d,i) {return d});



chart.append("text")
  .attr("class", "chart-title")
  .attr("x", (width / 2))
  .attr("y", -10)
  .text("Historical Monthly Global Land Temperatures");

chart.append("text")
  .attr("class", "axis-legend")
  .text("Month")
  .attr("transform", "translate(-50,150), rotate(-90)");

chart.append("text")
  .attr("class", "axis-legend")
  .text("Year")
  .attr("transform", "translate(" + (width/2) + "," + (height + 45) + ")");

// define tooltip
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url, function(error,data) {

  var baseline = data.baseTemperature;

  y.domain([0,12]);

  var minYear = d3.min(data.monthlyVariance, function(d) {return d.year;});
  var maxYear = d3.max(data.monthlyVariance, function(d) {return d.year;});
  x.domain([minYear, maxYear]);

  var xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(d3.format("d"));

  var yAxis = d3.axisLeft(y2)
    .tickSize(0,0)
    .ticks(d3.timeMonth)
    .tickFormat(d3.timeFormat("%B"));

  var yAxis2 = d3.axisLeft(y)
    .tickFormat("");


  var cellWidth = width / (maxYear - minYear + 1);
  var cellHeight = height / 12;

  var bar = chart.selectAll("g")
    .data(data.monthlyVariance)
    .enter().append("g");

  bar.append("rect")
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("x", function(d,i) {return x(d.year)})
    .attr("y", function(d) {return y(d.month - 1)})
    .style("fill", function(d) {return heatColor(d.variance + baseline)})
    .on("mouseover", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 1.0);
      div.html(function() {
          var tempStr = (d.variance + baseline).toString().match(/\d*\.\d{0,3}/) ? (d.variance + baseline).toString().match(/\d*\.\d{0,3}/)[0] : (d.variance + baseline).toString() + ".000";
          return months[d.month - 1] + " " + d.year + " <br/>" + tempStr +"&deg;C" })
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");;
    })
    .on("mouseout", function(d) {
    div.transition()
      .duration(200)
      .style("opacity", 0);
    });

  chart.append("g")
    .attr("class", "axis")
    .call(yAxis)
    .selectAll("text")
    .attr("y", 14 - cellHeight/2);

  chart.append("g")
    .attr("class", "axis")
    .call(yAxis2);

  chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle");

});
