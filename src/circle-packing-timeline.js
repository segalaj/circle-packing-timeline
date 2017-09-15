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
import { select, event } from "d3-selection";
import { pack, hierarchy } from "d3-hierarchy";
import { transition } from "d3-transition";
import { interpolateHcl } from "d3-interpolate"
import { scaleLinear } from "d3-scale";
import { path } from "d3-path";

export default function() {
  function circlePackingTimeline(input, width, height, containerSelector, color) {

    if (typeof(color) === "undefined") {
        color = scaleLinear()
            .domain([-1, 5])
            .range(["hsl(35, 100%, 62%)", "hsl(35, 64%, 34%)"])
            .interpolate(interpolateHcl);
    }

    var margin = 20;

    json(input, function (error, data) {
      if (error) {
        throw error;
      }

      var parents = data.children;
      var count = parents.length;
      var focus = null;

      var container = select(containerSelector).on("click", reset)
            .append("svg").attr("width", width - margin).attr("height", height - margin)
            .append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(1)");

      /**
       * Title
       */
      container.append("text").attr("class", "title").attr("y", -height / 3).text(data.name);

      /**
       * Steps
       */
      parents.forEach(function(parent, cmp) {
        var dec = count % 2 == 0 ? cmp - count / 2 + 0.5 : cmp - Math.floor(count / 2);
        var root = hierarchy(parent)
          .sum(function(d) { return d.size || 1; })
          .sort(function(a, b) { return b.value - a.value; });

        var myPack = pack()
          .size([width / count + margin, height / count + margin]);

        var nodes = myPack(root).descendants();

        /**
         * Arrows
         */
        if (cmp != 0) {
          container.append("path")
            .attr("d", arrow(width / count * (dec - 1) + root.r + margin, 0,
            width / count * dec - root.r - margin, 0))
            .style("stroke", color(1))
            .style("fill", "none");
        }

        /**
         * Circles
         */
        var rootContainer = container.append("g");
        rootContainer.selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("transform", function(d) { return "translate(" + (d.x - root.x + width / count * dec) + "," + (d.y - root.y) + ")"; })
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .each(function(d) { d.node = this; })
          .attr("r", function(d) { return d.r; })
          .style("fill", function(d) { return color(d.depth); })
          .on("click", zoomTo);

        /**
         * Texts
         */
        var texts = rootContainer.selectAll(".label")
          .data(nodes)
          .enter().append("g")
          .attr("transform", function(d) { return "translate(" + (d.x - root.x + width / count * dec) + "," + (d.y - root.y) + ")"; })
          .attr("class", "label")
          .style("display", function (d) { return d.parent === null  ? "inline" : "none"; });

        texts.append("text")
          .attr("class", "subtitle")
          .attr("y", function(d) { return d.data.desc ? (d.data.start && d.data.end ?  -20 : -5) : 0 })
          .text(function (d) { return d.data.name; });

        texts.filter(function(d) { return d.data.desc; })
          .append("text")
          .attr("y", function(d) { return d.data.start && d.data.end ? 0 : 5; })
          .text(function(d) { return d.data.desc; });

        texts.filter(function(d) { return d.data.start && d.data.end; })
          .append("text")
          .attr("y", "20")
          .text(function(d) { return d.data.start + " - " + d.data.end; });
       });

       /**
        * Footer
        */
        container.append("a").attr("xlink:href", "http://fr.linkedin.com/in/joachimsegala/")
          .attr("target", "_blank").attr("class", "footer")
          .append("text").attr("y", 2 * height / 5).text("By segalaj");

      /**
       * Call on event in order to zoom on called element.
       */
      function zoomTo(node) {
        focus = node;
        var dx = parseInt(node.node.transform.baseVal.getItem(0).matrix.e);
        var dy = parseInt(node.node.transform.baseVal.getItem(0).matrix.f);
        var r = parseInt(node.r);

        transform(dx, dy, 0.4 * height / r);
        event.stopPropagation();
      }

      /**
       * Call on event in order to reset the container view.
       */
      function reset() {
        if (focus !== null) {
          focus = null;
          transform(0, 0, 1);
        }
        event.stopPropagation();
      }

      /**
       * Transform the container view center on (x,y) with a scale.
       * @param x coordinate
       * @param y coordinate
       * @param scale
       */
      function transform(x, y, scale) {
        var translate = [width / 2 - scale * x, height / 2 - scale * y];
        container.transition(transition().duration(750))
          .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
          .selectAll(".label")
          .style("font-size", (15 / scale) + "px")
          .on("start", function (d) { return d.parent !== focus || d.parent === null ? this.style.display = "none" : undefined; })
          .on("end", function (d) { return d.parent === focus ? this.style.display = "inline" : undefined; });
      }

      /**
       * Compute a d3-path drawing an arrow.
       * @param x1 x start coordinate
       * @param y1 y start coordinate
       * @param x2 x end coordinate
       * @param y2 y end coordinate
       * @returns {path} arrow path
       */
      function arrow(x1, y1, x2, y2) {
        var arrowPath = path();
        arrowPath.moveTo(x1, y1 + 2);
        arrowPath.lineTo(x2 - 12, y2 + 2);
        arrowPath.lineTo(x2 - 16, y2 + 16);
        arrowPath.lineTo(x2, y2);
        arrowPath.lineTo(x2 - 16, y2 - 16);
        arrowPath.lineTo(x2 - 12, y2 - 2);
        arrowPath.lineTo(x1, y1 - 2);
        arrowPath.closePath();
        return arrowPath;
      }
    });
  }

  return circlePackingTimeline;
}
