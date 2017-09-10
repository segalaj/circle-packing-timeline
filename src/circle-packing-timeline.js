/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Joachim Segala
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { json } from "d3-request";
import { select } from "d3-selection";
import { pack, hierarchy } from "d3-hierarchy";

export default function() {
  function circlePackingTimeline(input, width, height, containerSelector) {
    var margin = 20;

    json(input, function (error, data) {
      if (error) {
        throw error;
      }

      var parents = data.children;
      var count = parents.length;

      var container = select(containerSelector).on('click', function(){alert('reset')})
            .append('svg').attr('width', width - margin).attr('height', height - margin)
            .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(1)');

      /**
       * Title
       */
      container.append('text').attr('class', 'title').attr('y', -height / 3).text(data.name);

      /**
       * Steps
       */
      parents.forEach(function(parent, cmp) {
        var dec = count % 2 == 0 ? cmp - count / 2 + 0.5 : cmp - Math.floor(count / 2);
        var root = hierarchy(parent);

        var myPack = pack()
          .size([width / count + margin, height / count + margin]);

        myPack(root
          .sum(function(d) { return d.size || 1; })
          .sort(function(a, b) { return b.size - a.size; })
        );

        var rootContainer = container.append('g')
          .attr("transform", function() { return "translate(" + (width / count * dec - root.x) + "," + (-root.y) + ")"; });
        var node = rootContainer.selectAll("g")
          .data(root.descendants())
          .enter().append("g")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
          .each(function(d) { d.node = this; });

        node.append("circle")
          .attr("id", function(d) { return "node-" + d.id; })
          .attr("r", function(d) { return d.r; })
          .style("fill", function() { return '#' + Math.floor(Math.random()*16777215).toString(16); });
       });

    });
  }

  return circlePackingTimeline;
}
