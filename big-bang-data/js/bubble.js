d3.json("data/hashtag_list.json", function(error, json) {
  if (error) throw error;

  var screenWidth = window.innerWidth
  if (screenWidth > 1200) {
    var width = 600;
    var height = 450;
  } else if  (screenWidth > 767) {
    var width = window.innerWidth/2;
    var height = window.innerWidth/2.66;
  } else {
    var width = window.innerWidth;
    var height = window.innerWidth/1.33;
  };

  var pack = d3.layout.pack()
    .size([width, height])
    .sort(null)
    .padding(5);

  var svg = d3.select("#bubble").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

  var node = svg.selectAll(".node")
    .data(pack.nodes(flatten(json)).filter(function(d) { return !d.children; }))
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("circle")
    .attr("r", function(d) { return d.r; });

  node.append("text")
    .text(function(d) { return d.name; })
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 12) + "px"; })
    .style("font-style", "Helvetica Neue")
    .style("fill", "white")
    .attr("dy", ".35em")
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function flatten(root) {
  var nodes = [];
  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    else nodes.push({name: "#" + node.hashtag, value: Math.pow(node.sum, 0.4)});
  }
  recurse(root);
  return {children: nodes.slice(0, 12)};
}