function newLineChart(selector, datasets, names) {

    if (datasets.length !== names.length)
        throw "Datasets and names don't have the same length";

    var xScale = new Plottable.Scales.Time();
    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    var configs = xAxis.axisConfigurations();
    var newConfigs = [];
    configs.forEach(function(tierConfiguration){
    var newTierConfiguration = [];
    tierConfiguration.forEach(function(row){
      if(row.interval === "day" ||
        row.interval === "month" ||
        row.interval === "year"){
        newTierConfiguration.push(row);
      }
    });
    newConfigs.push(newTierConfiguration);
    });
    xAxis.axisConfigurations(newConfigs);

    var yScale = new Plottable.Scales.Linear();
    var gridlines = new Plottable.Components.Gridlines(null, yScale);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    yAxis.formatter(Plottable.Formatters.shortScale(1));
    // yAxis.tickLabelPadding(3);



    var colorScale = new Plottable.Scales.Color();
    colorScale.range(["#8341AC", "#199AD7", "#4EE5AD", "#1CB372", "#FB7030", "#FBB275", "#9E8676"]);

    var series = [];
    _.each(names, (n, i) => {
        var set = new Plottable.Dataset(datasets[i], {name: n});
        series.push(set);
    });

    var plot = new Plottable.Plots.Line();
    plot
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale)
        .attr("stroke", function(d, i, dataset) { return dataset.metadata().name; }, colorScale)
        .attr("stroke-width", 7)
        .interpolator("basis")
        .autorangeMode("y");
    
    _.each(series, s => plot.addDataset(s));

    var legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(7);

    var group = new Plottable.Components.Group([plot, gridlines]);
    var chart = new Plottable.Components.Table([
        [null, legend], 
        [yAxis, group], 
        [null, xAxis]]);

    chart.renderTo(selector);
    window.addEventListener("resize", function () {
        chart.redraw();
    });
}

d3.json("data/primary_candidate_volume.json", function(error, data){
    var names    = [];
    var datasets = [];
    var politicians = {};
    var index = 0;
    var my_format = d3.time.format("%d/%m/%Y")
    _.each(data, d => {
        if (politicians[d.candidate] == null) {
            politicians[d.candidate] = index;
            index += 1;
            names.push(d.candidate);
            datasets.push([{
                x: my_format.parse(d.date),
                y: d.sum
            }]);
        } else {
            var idx = politicians[d.candidate];
            datasets[idx].push({
                x: my_format.parse(d.date),
                y: d.sum
            });
        }

    });
    console.log(datasets)

newLineChart("svg#volume_by_candidate", datasets, names);
});