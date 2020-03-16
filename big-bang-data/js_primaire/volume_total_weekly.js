function weeklyVolumeChart() {

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Linear();
  var gridlines = new Plottable.Components.Gridlines(null, yScale);
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

  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  yAxis.formatter(Plottable.Formatters.shortScale(1));
  yAxis.showEndTickLabels(false);
  d3.json("data/primary_weekly_global_volume.json", function(error, data){

    var lower_bound = Math.floor(d3.min(data, function(d) {return +d.sum;})*0.9);

    var plot = new Plottable.Plots.Area()
      .y0(lower_bound, yScale)
      .attr("stroke-width", 0)
      // .attr("opacity", 1)
      .attr("fill", "#FFFFFF")
      .attr("fill-opacity", 0.5)
      .interpolator("basis");

    var my_format = d3.time.format("%d/%m/%Y")
    plot.x(function(d) { return my_format.parse(d.date); }, xScale);
    plot.y(function(d) { return d.sum; }, yScale);
 
    var dataset = new Plottable.Dataset(data);
    plot.addDataset(dataset);

    var group = new Plottable.Components.Group([plot, gridlines]);
    var chart = new Plottable.Components.Table([[yAxis, group], [null, xAxis]]);

    chart.renderTo("svg#volume_total_weekly");
    window.addEventListener("resize", function () {
      chart.redraw();
    });
  })
}

$(document).ready(function() {
  weeklyVolumeChart();
});