
var width = 100;
var height = 100;
var padding = 5;
var legendPadding = 20;

// Star functions: These functions are necessary to create a star

var rad = 2*Math.PI;
var colorScale = new Plottable.Scales.Color();
colorScale.range(["#006837", "#8BC599", "#00FFFF"]);

function star_points(radius, number){
    var starLines = [];
    var tipSet = [];
    for (i = 0; i < number; i++) {
        var xPos = Math.cos(i*rad/number);
        var yPos = Math.sin(i*rad/number);
        var line = [{x: radius, y: radius}, 
        {x: radius*(1+xPos), 
        y: radius*(1+yPos)}];
        var lineSet = new Plottable.Dataset(line);
        var lineTip = 
        {x: radius + (radius + padding) * xPos, 
         y: radius + (radius + padding) * yPos}
        tipSet.push(lineTip);
        starLines.push(lineSet);
    }
    // Add a point for the legend
    tipSet.push({x:radius, y:2*radius + legendPadding});
    var lineTips = new Plottable.Dataset(tipSet);
    return [starLines, lineTips];
};

// put the points on the different axes
function points_on_axes(radius, number, data){
    var collectionNumber = Object.keys(data).length;
    var dataLines = [];
    var dataLabels = [];
    for (n = 0; n < collectionNumber; n++){
        var dataPoints = [];
        var sumValues = (data[n].data.map(function(i, j){return i.sum}));
        var sumRange = Math.max.apply(null, sumValues);
        for (i = 0; i < number; i++) { 
            var dataPoint = 
            {x: radius + radius*Math.cos(i*rad/number)*data[n].data[i].sum/sumRange,
            y: radius + radius*Math.sin(i*rad/number)*data[n].data[i].sum/sumRange}
            dataPoints.push(dataPoint);
        }
        dataPoints.push(dataPoints[0]);
        var dataLine = new Plottable.Dataset(dataPoints);
        dataLines.push(dataLine);
        dataLabels.push(data[n].population);
    }
    return [dataLines, dataLabels]
}

// // Data loader
d3.json("data/globalized_topic.json", function(error, data){
    // Get the number of axis
    var axisNumber = Object.keys(data[0].data).length;
    var collectionNumber = Object.keys(data).length;
    var radius = Math.min(width/2, height/2);

    // Create the star:
    var starLines, tipPoints;
    [starLines, tipPoints] = star_points(radius, axisNumber);
    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var starLinesPlot = new Plottable.Plots.Line()
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale)
        .attr("stroke", "#C0C3C4");
    _.each(starLines, s => starLinesPlot.addDataset(s));

    // Add the tips
    var labelsPlot = new Plottable.Plots.Scatter()
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale)
        .addDataset(tipPoints)
        .size(0);

    var dataLines, dataLabels;
    [dataLines, dataLabels] = points_on_axes(radius, axisNumber, data);

    function plot_data(data, colorIndex, group){
        // add the points
        var dataPointsPlot = new Plottable.Plots.Scatter()
            .addDataset(data)
            .x(function(d) { return d.x; }, xScale)
            .y(function(d) { return d.y; }, yScale)
            .attr("fill", colorScale.scale(colorIndex))
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1)
            .size(10);
        group.append(dataPointsPlot);

        // Add the data (and the shade)
        var dataLinePlot = new Plottable.Plots.Area()
            .addDataset(data)
            .x(function(d) { return d.x; }, xScale)
            .y(function(d) { return d.y; }, yScale)
            .attr("stroke", colorScale.scale(colorIndex))
            .attr("stroke-opacity", 1)
            .attr("fill", colorScale.scale(colorIndex))
            .attr("fill-opacity", 0.1);
            group.append(dataLinePlot);
        }

    var group = new Plottable.Components.Group([starLinesPlot, labelsPlot]);
    _.each(dataLines, (s, i) => plot_data(s, i, group));

    var legend = new Plottable.Components.Legend(colorScale);
    colorScale.domain(dataLabels);

    group.renderTo("svg#plottable_star");
    legend.renderTo("svg#plottable_star");

    function print_axis_labels(radius, number, data){
        var entities = labelsPlot.entities()
        for (i = 0; i < number; i++) {
            var text = svg.append("text")
            .attr('x', entities[i].position.x)
            .attr('y', entities[i].position.y)
            .text(data[i].topic)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-family", "Helvetica Neue", "sans-serif")
            .attr("font-size", "14px")
            .attr("fill", "#2C3E50")
        }
    }

    //  Add labels with d3js
    var svg = d3.select('svg#plottable_star.plottable')
    print_axis_labels(radius, axisNumber, data[0].data);
});