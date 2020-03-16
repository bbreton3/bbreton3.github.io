d3.starPlot = function() {
  var trendsWidth = 200,
      margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      labelMargin = 24,
      titleMargin = 50,
      includeGuidelines = true,
      includeLabels = true,
      accessors = [],
      labels = [],
      title = nop,

      radius = trendsWidth / 2,
      origin = [radius, radius],
      radii = accessors.length,
      radians = 2 * Math.PI / radii,
      scale = d3.scale.linear()
        .domain([0, 100])
        .range([0, radius])

  function chart(selection) {
    datum = selection.datum();
    g = selection
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    if (includeGuidelines) {
      drawGuidelines();
    }
    if (includeLabels) {
      drawLabels();
    }

    drawChart();
  }

  function drawGuidelines() {
    var r = 0;
    accessors.forEach(function(d, i) {
      var l, x, y;

      l = radius;
      x = l * Math.cos(r);
      y = l * Math.sin(r);
      g.append('line')
        .attr('class', 'star-axis')
        .attr('x1', origin[0])
        .attr('y1', origin[1])
        .attr('x2', origin[0] + x)
        .attr('y2', origin[1] + y)

      r += radians;
    })
  }

  function drawLabels() {
    var r = 0;
    accessors.forEach(function(d, i) {
      var l, x, y;

      l = radius;
      x = (l + labelMargin) * Math.cos(r);
      y = (l + labelMargin) * Math.sin(r);
      g.append('text')
        .attr('class', 'star-label')
        .attr('x', origin[0] + x)
        .attr('y', origin[1] + y)
        .text(labels[i])
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')

      r += radians;
    })
  }

  function drawChart() {
    g.append('circle')
      .attr('class', 'star-origin')
      .attr('cx', origin[0])
      .attr('cy', origin[1])
      .attr('r', 2)

    var path = d3.svg.line.radial()

    var pathData = [];
    var r = Math.PI / 2;
    accessors.forEach(function(d) {
      pathData.push([
        scale(d(datum)),
        r
      ])
      r += radians;
    });

    g.append('path')
      .attr('class', 'star-path')
      .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
      .attr('d', path(pathData) + 'Z');

    g.append('text')
      .attr('class', 'star-title')
      .attr('x', origin[0])
      .attr('y', origin[0]+ width/2 + titleMargin)
      .text(title(datum))
      .style('text-anchor', 'middle')
  }

  function nop() {
    return;
  }

  chart.accessors = function(_) {
    if (!arguments.length) return accessors;
    accessors = _;
    radii = accessors.length;
    radians = 2 * Math.PI / radii;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    radius = width / 2;
    origin = [radius, radius];
    scale.range([0, radius])
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    origin = [radius, radius];
    return chart;
  };

  chart.labelMargin = function(_) {
    if (!arguments.length) return labelMargin;
    labelMargin = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };

  chart.labels = function(_) {
    if (!arguments.length) return labels;
    labels = _;
    return chart;
  };

  chart.includeGuidelines = function(_) {
    if (!arguments.length) return includeGuidelines;
    includeGuidelines = _;
    return chart;
  };

  chart.includeLabels = function(_) {
    if (!arguments.length) return includeLabels;
    includeLabels = _;
    return chart;
  };

  return chart;
}

var margin = {
  top: 55,
  right: 55,
  bottom: 55,
  left: 55
};
trendsWidth = 230 - margin.left - margin.right;
height = 230 - margin.top - margin.bottom;
var labelMargin = 18;


var scale = d3.scale.linear()
  .domain([0, 4])
  .range([0, 100])



d3.csv("data/topic_candidate_weekly.csv")
  .row(function(d) {
      d.bilan = +d.bilan;
      d.sante = +d.sante;
      d.impot = +d.impot;
      d.immigration = +d.immigration;      
      d.etranger = +d.etranger;
      d.enseignement = +d.enseignement;
      d.economie = +d.economie;
      d.defense = +d.defense;
      return d;
  })

  .get(function(error, rows) {
    var star = d3.starPlot()  
      .width(trendsWidth)
      .accessors([
        function(d) { return scale(d.bilan); },
        function(d) { return scale(d.sante); },
        function(d) { return scale(d.impot); },
        function(d) { return scale(d.immigration); },
        function(d) { return scale(d.etranger); },
        function(d) { return scale(d.enseignement); },
        function(d) { return scale(d.economie); },
        function(d) { return scale(d.defense); }  
      ])
      .labels([
        'bilan',
        'sante',
        'impot',
        'immigration',
        'etranger',
        'enseignement',
        'economie',
        'defense'        
      ])
      .title(function(d) { return d.candidate; })
      .margin(margin)
      .labelMargin(labelMargin)

    rows.forEach(function(d, i) {
      star.includeLabels(i % 1 === 0 ? true : false);
      console.log(i)

      d3.select('#trends').append('svg')
        .attr('class', 'chart')
        .attr('width', trendsWidth + margin.left + margin.right)
        .attr('height', trendsWidth + margin.top + margin.bottom)
        .append('g')
        .datum(d)
        .call(star)
    });
  });