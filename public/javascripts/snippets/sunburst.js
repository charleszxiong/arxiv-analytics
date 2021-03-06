/*!
 * Sunburst chart snippets
 */

function sunburst (data, options) {
  'use strict';

  var PI = Math.PI;
  var chart = d3.select('#' + (options.id || 'chart'));
  var width = Math.max(parseInt(chart.style('width')) || 300, 300);
  var height = 0.833333 * width || 250;
  var radius = Math.min(width, height) / 2;
  var x = d3.scale.linear().range([0, 2 * PI]);
  var y = d3.scale.sqrt().range([0, radius]);
  var color = d3.scale.category20c();

  // Create the SVG container and set the origin
  var svg = chart.append('svg')
      .attr('width', width).attr('height', height).append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')');

  var partition = d3.layout.partition().value(options.partition);

  var arc = d3.svg.arc()
      .startAngle(function (d) {
        return Math.max(0, Math.min(2 * PI, x(d.x)));
      }).endAngle(function (d) {
        return Math.max(0, Math.min(2 * PI, x(d.x + d.dx)));
      }).innerRadius(function (d) {
        return Math.max(0, y(d.y));
      }).outerRadius(function (d) {
        return Math.max(0, y(d.y + d.dy));
      });

  var tooltip = chart.append('div')
      .attr('id', (options.tooltip.id || 'tooltip')).style('opacity', 0);

  var path = svg.selectAll('path').data(partition.nodes(data))
      .enter().append('path').attr('d', arc)
      .style('fill', function (d) {
        return color(options.normalize(d));
      }).on('click', function (d) {
        path.transition().duration(750).attrTween('d', arcTween(d));
      }).on('mouseover', function (d) {
        tooltip.transition().duration(200).style('opacity', 0.8);
        tooltip.html(options.tooltip.html(d))
           .style('left', (d3.event.pageX + 20) + 'px')
           .style('top', (d3.event.pageY - 45) + 'px');
      }).on('mousemove', function (d) {
        var offset = parseInt(tooltip.style('width')) * .5
        tooltip.style('left', (d3.event.pageX - offset) + 'px')
           .style('top', (d3.event.pageY - 45) + 'px');
      }).on('mouseout', function (d) {
        tooltip.transition().duration(500).style('opacity', 0);
      });

  function arcTween (d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
    var yd = d3.interpolate(y.domain(), [d.y, 1]);
    var yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function (d, i) {
      return i ? function (t) {
        return arc(d);
      } : function (t) {
        x.domain(xd(t));
        y.domain(yd(t)).range(yr(t));
        return arc(d);
      };
    };
  }

}
