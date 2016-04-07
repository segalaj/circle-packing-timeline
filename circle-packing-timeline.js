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
d3.circlePackingTimeline = function (json, width, height, containerSelector, color) {
    if (typeof(color) === 'undefined') {
        color = d3.scale.linear()
            .domain([-1, 5])
            .range(["hsl(35, 100%, 62%)", "hsl(35, 64%, 34%)"])
            .interpolate(d3.interpolateHcl);
    }

    var margin = 20;

    d3.json("data.json", function (error, root) {
        if (error) {
            throw error;
        }

        var focus = undefined;
        var steps = root.children;
        var count = steps.length;

        var container = d3.select(containerSelector)
            .on("click", reset)
            .append("svg")
            .attr("width", width - margin)
            .attr("height", height - margin)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(1)");

        /**
         * Title
         */
        container.append("text").attr("class", "title").attr("y", -height / 3).text(root.name);

        /**
         * Steps
         */
        steps.forEach(function (step, cmp) {
            var pack = d3.layout.pack()
                .size([width / count, height / count])
                .value(function (d) {
                    return d.size || 1;
                });
            var dec = count % 2 == 0 ? cmp - count / 2 + 0.5 : cmp - Math.floor(count / 2);
            var g = container.append("g");
            var nodes = pack.nodes(step);

            /**
             * Arrow
             */
            if (cmp != 0) {
                container.append("path")
                    .attr("d", arrow(width / count * (dec - 1) + step.r + margin, 0,
                            width / count * dec - step.r - margin, 0))
                    .style("stroke", color(1))
                    .style("fill", "none");
            }

            /**
             * Circles
             */
            var circle = g.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function (d) {
                    return d.children ? "node" : "node node--leaf";
                })
                .attr("cx", function (d) {
                    return d.x - step.x + width / count * dec;
                })
                .attr("cy", function (d) {
                    return d.y - step.y;
                })
                .attr("r", function (d) {
                    return d.r;
                })
                .style("fill", function (d) {
                    return color(d.depth);
                })
                .on("click", zoomTo);

            /**
             * Texts
             */
            var texts = g.selectAll(".label")
                .data(nodes)
                .enter().append("g")
                .attr("class", "label")
                .style("display", function (d) {
                    return d.parent === undefined ? "inline" : "none";
                })
                .attr("transform", function (d) {
                    return "translate("
                        + (d.x - step.x + width / count * dec) + ","
                        + (d.y - step.y) + ")";
                });

            // Title
            texts.append("text")
                .attr("class", "subtitle")
                .attr("y", function (d) {
                    if (d.desc) {
                        if (d.start && d.end) {
                            return -20;
                        } else {
                            return -5;
                        }
                    }
                    return 0;
                })
                .text(function (d) {
                    return d.name;
                });

            // Description
            texts.filter(function (d) {
                return d.desc
            })
                .append("text")
                .attr("y", function (d) {
                    if (d.start && d.end) {
                        return 0;
                    }
                    return 5;
                })
                .text(function (d) {
                    return d.desc;
                });

            // Date
            texts.filter(function (d) {
                return d.start && d.end
            })
                .append("text")
                .attr("y", "20")
                .text(function (d) {
                    return d.start + " - " + d.end;
                });
        });

        /**
         * Footer
         */
        container.append("a").attr("xlink:href", root.url).attr("target", "_blank").attr("class", "footer")
            .append("text").attr("y", 2 * height / 5).text("By me!");

        /**
         * Call on event in order to zoom on called element.
         */
        function zoomTo() {
            var element = d3.select(this);
            focus = element.datum();
            var dx = parseInt(element.attr("cx"));
            var dy = parseInt(element.attr("cy"));
            var r = parseInt(element.attr("r"));

            transform(dx, dy, 0.4 * height / r);
            d3.event.stopPropagation();
        }

        /**
         * Call on event in order to reset the container view.
         */
        function reset() {
            focus = undefined;
            transform(0, 0, 1);
            d3.event.stopPropagation();
        }

        /**
         * Transform the container view center on (x,y) with a scale.
         * @param x coordinate
         * @param y coordinate
         * @param scale
         */
        function transform(x, y, scale) {
            var translate = [width / 2 - scale * x, height / 2 - scale * y];

            container.transition()
                .duration(750)
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
                .selectAll(".label")
                .each("start", function (d) {
                    if (d.parent !== focus || d.parent === undefined) this.style.display = "none";
                })
                .each("end", function (d) {
                    if (d.parent === focus) this.style.display = "inline";
                })
                .selectAll("text")
                .style("font-size", 15 / scale);
        }

        /**
         * Compute a SVG path drawing an arrow.
         * @param x1 x start coordinate
         * @param y1 y start coordinate
         * @param x2 x end coordinate
         * @param y2 y end coordinate
         * @returns {string} SVG path
         */
        function arrow(x1, y1, x2, y2) {
            return "M" + x1 + " " + (y1 + 2) + " " +
                "L" + (x2 - 12) + " " + (y2 + 2) + " " +
                "L" + (x2 - 16) + " " + (y2 + 16) + " " +
                "L" + x2 + " " + y2 + " " +
                "L" + (x2 - 16) + " " + (y2 - 16) + " " +
                "L" + (x2 - 12) + " " + (y2 - 2) + " " +
                "L" + x1 + " " + (y1 - 2) + " Z";
        }
    });
};