function newLineChart(selector, ds, names) {

    if (ds.length !== names.length)
        throw "Datasets and names don't have the same length";

    var xScale = new Plottable.Scales.Time();
    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    // var newConfigs = [];
    // var tiers = [];
    // tiers.push({ formatter: new Plottable.Formatters.time("%d"),
    //            interval: Plottable.TimeInterval.day,
    //            step: 1 });
    // tiers.push({ formatter: new Plottable.Formatters.time("%B"),
    //            interval: Plottable.TimeInterval.month,
    //            step: 1 });
    // tiers.push({ formatter: new Plottable.Formatters.time("%Y"),
    //            interval: Plottable.TimeInterval.year,
    //            step: 1 });
    // newConfigs.push(tiers);
    // xAxis.axisConfigurations(newConfigs);
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
    yAxis.formatter(Plottable.Formatters.shortScale(0));

    var color = ["#8341AC", "#199AD7", "#F94F47", "#4EE5AD", "#FBB275"];


    var series = [];
    _.each(names, (n, i) => {
        var set = {}
        set.dataset = new Plottable.Dataset(ds[i], {name: n, color:color[i]});
        series.push(set);
    });

    series.forEach(function(dataObject) {
            dataObject.include = true;
    });

    var includeDatasets = function() {
            var dataset = [];
            series.forEach(function(dataObject) {
                    if(dataObject.include === true) {
                            dataset.push(dataObject.dataset)
                    }
            });
            plot.datasets(dataset);
    };

    var toggle = function(label, object) {
            if (label.hasClass("selected")) {
                    label.text("☐" + label.text().slice(1, label.text().length));
                    label.removeClass("selected");
                    object.include = false;
            }
            else {
                    label.text("☑" + label.text().slice(1, label.text().length));
                    label.addClass("selected");
                    object.include = true;
            }
            includeDatasets();
    };
    var makeLabel = function(string) {
            return new Plottable.Components.Label(string, 0)
                    .addClass("selected")
                    .xAlignment("left");
    }
    var plot = new Plottable.Plots.Line();
    plot
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale)
        .attr("stroke", function(d, i, dataset) { return dataset.metadata().color; })
        .attr("stroke-width", 7)
        .interpolator("basis")
        .autorangeMode("y");
    includeDatasets();

    var labels = [];
    _.each(names, (n, i) => {
        var label = makeLabel("☑ "+n) 
        labels.push([label]);
    });
    var legend = new Plottable.Components.Table(labels);  
    var group = new Plottable.Components.Group([plot, gridlines]);
    var chart = new Plottable.Components.Table([
        [null, legend], 
        [yAxis, group], 
        [null, xAxis]]);
    _.each(labels, (label, i) => {
            new Plottable.Interactions.Click()
                    .onClick(function() {
                            toggle(label[0], series[i])
                    })
            .attachTo(label[0]);
    });
    chart.renderTo(selector);
    window.addEventListener("resize", function () {
        chart.redraw();
    });
}

d3.json("data/candidate_volume.json", function(error, data){
    var names    = [];
    var ds = [];
    var politicians = {};
    var index = 0;
    var my_format = d3.time.format("%d/%m/%Y")
    _.each(data, d => {
        if (politicians[d.candidate] == null) {
            politicians[d.candidate] = index;
            index += 1;
            names.push(d.candidate);
            ds.push([{
                x: my_format.parse(d.date),
                y: d.sum
            }]);
        } else {
            var idx = politicians[d.candidate];
            ds[idx].push({
                x: my_format.parse(d.date),
                y: d.sum
            });
        }

    });

newLineChart("svg#volume_by_candidate", ds, names);
});
