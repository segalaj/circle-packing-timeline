# circle-packing-timeline [![Build Status](https://travis-ci.org/segalaj/circle-packing-timeline.svg?branch=master)](https://travis-ci.org/segalaj/circle-packing-timeline)

a d3.js plugin based on circle packing

## Demo
[Live demo.](http://segalaj.ovh)

## Installing
If you use NPM, `npm install circle-packing-timeline`. Otherwise, clone the git repository and `npm install` in the root directory.

## How to use it

### index.html
```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>John Doe website</title>
    <link rel="stylesheet" href="css/style.css"/>
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="circle-packing-timeline.min.js"></script>
</head>
<body>
<script>
    var width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    var timeline = d3.circlePackingTimeline();
    timeline("data.json", width, height, "body");
</script>
</body>
</html>
```
### data.json
```json
{
    "name": "John Doe",
    "children": [
        {
            "name": "Company 1",
            "desc": "Description 1",
            "start": "2010",
            "end": "2013",
            "children": [
                {
                    "name": "Tools",
                    "children": [
                        {
                            "name": "Git",
                            "size": 2
                        },
                        {
                            "name": "Jenkins"
                        }
                    ]
                },
                {
                    "name": "Languages",
                    "children": [
                        {
                            "name": "C++"
                        },
                        {
                            "name": "Java"
                        }
                    ]
                }
            ]
        },
        {
            "name": "Company 2",
            "start": "2014",
            "end": "2016",
            "children": [
                {
                    "name": "Tools",
                    "children": [
                        {
                            "name": "Git"
                        },
                        {
                            "name": "Jenkins"
                        },
                        {
                            "name": "Sonar"
                        }
                    ]
                },
                {
                    "name": "Languages",
                    "children": [
                        {
                            "name": "Java"
                        },
                        {
                            "name": "Javascript",
                            "size": 3
                        }
                    ]
                }
            ]
        }
    ]
}
```
### style.css
```css
.title {
    font-size: 25px;
}

.title,
.footer,
.label {
    font: 15px "Helvetica Neue", Helvetica, Arial, sans-serif;
    text-anchor: middle;
}

.node {
  cursor: pointer;
}

.node:hover {
  stroke: rgba(0, 0, 0, 0.67);
  stroke-width: 1.5px;
}

.label,
.node--leaf {
  pointer-events: none;
}
```
