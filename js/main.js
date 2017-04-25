$(function() {
    // Read data
    d3.csv('data/prepped_data.csv', function(error, data) {

        // Setting defaults
        var margin = {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = 960,
            height = 500,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            measure = 'current_male'; // variable to visualize

        // Append a wrapper div for the chart
        var div = d3.select('#vis')
            .append("div")
            .attr('height', height)
            .attr('width', width)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        /* ********************************** Create hierarchical data structure & treemap function  ********************************** */

        // Nest data *by region* using d3.nest()
        var nestedData = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(data);

        // Define a hierarchy for data
        var root = d3.hierarchy({
            values: nestedData
        }, function(d) {
            return d.values;
        });


        // Create a *treemap function* that will compute your layout given data structure
        var treemap = d3.treemap() // function that returns a function!
            .size([width, height]) // set size: scaling will be done internally
            .round(true)
            .tile(d3.treemapResquarify)
            .padding(0);

        /* ********************************** Create an ordinal color scale  ********************************** */

        // Get list of regions for colors
        var regions = nestedData.map(function(d) {
            return d.key;
        });

        // Set an ordinal scale for colors
        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory20);



        /* ********************************** Write a function to perform the data-join  ********************************** */

        // Write `draw` function to bind data, and position elements
        var draw = function() {

            // Redefine which value want to visualize in data by using the `.sum()` method
            root.sum(function(d) {
                return +d[measure];
            });

            // (Re)build treemap data structure by passing `root` to `treemap` function
            treemap(root);

            // Bind data to a selection of elements with class node
            // The data that you want to join is array of elements returned by `root.leaves()`
            var nodes = div.selectAll(".node").data(root.leaves());

            // Enter and append elements, then position them using the appropriate *styles*
            nodes.enter()
                .append("div")
                .text(function(d) {
                    return d.data.country;
                })
                .merge(nodes)
                .attr('class', 'node')
                .transition().duration(1200)
                .style("left", function(d, i) {
                    return d.x0 + "px";
                })
                .style("top", function(d) {
                    return d.y0 + "px";
                })
                .style('width', function(d) {
                    return d.x1 - d.x0 + 'px';
                })
                .style("height", function(d) {
                    return d.y1 - d.y0 + "px";
                })
                .style("background", function(d, i) {
                    return colorScale(d.data.region);
                });
        };

        // Call draw function
        draw();

        // Listen to change events on the input elements
        $("input").on('change', function() {
            // Set measure variable to the value (which is used in the draw funciton)
            measure = $(this).val();

            // Draw elements
            draw();
        });
    });
});