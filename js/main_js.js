var url = "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json";

var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

var width = 1000 - margin.left - margin.right; // base number needs to match wrapper
var height = 700 - margin.top - margin.bottom;
var distanceMax = 100;
var distanceMin = 40
var charge = -65;

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var flags = d3.select(".flag-holder")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d, i) {
        return i;
    }))
    .force("charge", d3.forceManyBody()
        .strength(charge)
        .distanceMin(distanceMin)
        .distanceMax(distanceMax))
    .force("center", d3.forceCenter(width / 2, height / 2));

// define tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json(url, function(error, data) {

    if (error) throw error;

    var links = data.links;
    var nodes = data.nodes;

    var link = chart.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line");

    // var node = chart.selectAll("g")

    var node = chart.append("g")
        .attr("class", "nodes")
        // .selectAll("circle")
        .selectAll("circle")
        .data(nodes)
        .enter().append("g");

    var nodeFill = flags.selectAll(".nodes")
        // .selectAll("img")
        .data(nodes)
        .enter().append("img")
        .attr("class", function(d) {
            return "flag flag-" + d.code;
        })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 1.0);
            div.html(d.country)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", 0);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));;

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.links);

    function ticked() {
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        nodeFill
            .style("left", function(d) {
                return d.x - (25 / 2) + "px";
            })
            .style("top", function(d) {
                return d.y - (15 / 2) + "px";
            });
    }

});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
