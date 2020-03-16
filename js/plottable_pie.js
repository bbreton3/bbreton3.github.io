


d3.json("data/candidate_volume_last_24h.json", function(error, data) {

	var scale = new Plottable.Scales.Linear();
	var colorScale = new Plottable.Scales.Color();
    colorScale.range(["#8341AC", "#199AD7", "#F94F47", "#4EE5AD", "#FBB275"]);

	var pie = new Plottable.Plots.Pie()
	  .addDataset(new Plottable.Dataset(data))
	  .sectorValue(function(d) { return d.sum; }, scale)
	  .attr("fill", function(d){ return d.candidate; }, colorScale)
	  .labelsEnabled(true);
	
	var legend = new Plottable.Components.Legend(colorScale);
	legend.xAlignment("right")
  	.yAlignment("top");
    
  table = new Plottable.Components.Table([[pie, legend]]).renderTo("svg#plottable_pie");

  window.addEventListener("resize", function() {
  	table.redraw();
	});
});

