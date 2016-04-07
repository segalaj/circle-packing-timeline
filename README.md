# circle-packing-timeline
a d3.js plugin based on circle packing

## Demo
[Live demo.](http://segalaj.ovh)

## How to use it

### index.html
```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>John Doe website</title>
    <link rel="stylesheet" href="css/style.css"/>
    <script src="//d3js.org/d3.v3.min.js"></script>
    <script src="circle-packing-timeline.js"></script>
</head>
<body>
<script>
    var width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    d3.circlePackingTimeline("data.json", width, height, "body");
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