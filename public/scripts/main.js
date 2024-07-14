/**
 * @file This file contains the main JavaScript code for the d3_test project.
 * It includes functions to load and filter data, build a chart using D3.js, and handle mouse events.
 * @see {@link https://github.com/username/repo} for more information.
 * @author UncleDreiAI
 * @version 1.0.0
 */
/**
 * @file This file contains the main JavaScript code for the d3_test project.
 * It includes functions to load and filter data, build a chart using D3.js, and handle mouse events.
 */
/**
 * @file This file contains the main JavaScript code for the d3_test project.
 * It includes functions to load and filter data, build a chart using D3.js, and handle mouse events.
 */

// Set the width and height for the chart
const width = window.innerWidth - 20;
const height = window.innerHeight - 20;
const radius = Math.min(width, height) / 2 - 50;

// Select the tooltip element
const tooltip = d3.select("#tooltip");

// Initialize variables
let page = 1;
let currentPage = 0;
let pages = [];
let filteredData;
let csvData;
let arc;
let arcHover;
let outerArc;

// Load the data from CSV file and build the initial chart
d3.csv("FruitTest20240401.csv").then((data) => {
  // Filter the data
  filteredData = dataFilter(data);

  // Build the chart with the first page of filtered data
  buildChart(filteredData[currentPage]);
});

// Add a button for navigating to the next page
d3.select("#buttonArea")
  .append("button")
  .attr("id", "nextButton")
  .text("Next Page")
  .on("click", () => {
    currentPage++;
    let pageCounter = pages.length - 1;
    if (currentPage >= pageCounter) {
      currentPage = pageCounter;
    }
    d3.select("svg").selectAll("*").remove();
    filteredData = pages[currentPage];
    buildChart(filteredData);

    if (currentPage >= 1) {
      d3.select("button#prevButton").style("display", "block");
    }

    if (currentPage >= pages.length - 1) {
      d3.select("button#nextButton").style("display", "none");
    }
  });

// Add a button for navigating to the previous page
d3.select("#buttonArea")
  .append("button")
  .attr("id", "prevButton")
  .text("Previous Page")
  .style("display", "none")
  .on("click", () => {
    currentPage--;

    if (currentPage <= 0) {
      currentPage = 1;
    }

    d3.select("svg").selectAll("*").remove();
    filteredData = pages[currentPage - 1];
    buildChart(filteredData);

    if (currentPage == 1) {
      d3.select("button#prevButton").style("display", "none");
    }

    if (currentPage > 1) {
      d3.select("button#nextButton").style("display", "block");
    }
  });

/**
 * Load the data and build the chart.
 * @param {Array} filteredData - The filtered data to be used for building the chart.
 */
function buildChart(filteredData) {
  const svg = d3.select("#mySvg").attr("width", width).attr("height", height);

  let g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  let pie = d3.pie().value((d) => d.Count)(filteredData);

  arc = d3
    .arc()
    .innerRadius(radius / 2)
    .outerRadius(radius);

  arcHover = d3
    .arc()
    .innerRadius(radius / 2 - 10)
    .outerRadius(radius + 20);

  outerArc = d3
    .arc()
    .innerRadius(radius * 1.1)
    .outerRadius(radius * 1.1);

  let arcs = g
    .selectAll(".arc")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs
    .append("path")
    .attr("fill", (d, i) => {
      return d3.schemeSet3[i % d3.schemeSet3.length]; // Added modulus operation to avoid going out of bounds
    })
    .attr("d", arc)
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .on("mousemove", mouseMove);

  arcs.append("path").attr("d", outerArc).attr("class", "outerArc");

  var labels = arcs
    .append("text")
    .attr("transform", function (d) {
      var centroid = outerArc.centroid(d);
      return "translate(" + centroid[0] + "," + centroid[1] + ")";
    })
    .attr("text-anchor", function (d) {
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return midAngle > Math.PI ? "end" : "start";
    })
    .attr("dy", ".35em")
    .attr("dx", function (d) {
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return midAngle > Math.PI ? "-0.2em" : "0.2em";
    })
    .attr("padding", 10)
    .text(function (d) {
      return d.data.Fruit;
    });

  labels.each(function (d) {
    var bbox = this.getBBox();
    d.bottom = bbox.y + bbox.height;
    d.length = bbox.width;
  });

  arcs
    .append("polyline")
    .attr("points", function (d) {
      var startingPoint = arc.centroid(d);
      var midPoint = [
        outerArc.centroid(d)[0],
        outerArc.centroid(d)[1] + d.bottom + 5,
      ];
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      var x;
      if (midAngle > Math.PI) {
        x = outerArc.centroid(d)[0] - d.length;
      } else {
        x = outerArc.centroid(d)[0] + d.length;
      }
      var endingPoint = [x, outerArc.centroid(d)[1] + d.bottom + 5];
      return [startingPoint, midPoint, endingPoint];
    })
    .attr("stroke", "black")
    .attr("fill", "none");
}


/**
 * Filters and processes data to generate grouped and paginated results.
 *
 * @param {Array} data - The input data to be filtered and processed.
 * @returns {Array} - The grouped and paginated data.
 */
function dataFilter(data) {
  data = data.filter((d) => {
    return d.Type != "";
  });

  let typeCounts = {};
  data.forEach((d) => {
    if (typeCounts[d.Type]) {
      typeCounts[d.Type]++;
    } else {
      typeCounts[d.Type] = 1;
    }
  });

  data.forEach((d) => {
    d.Count = typeCounts[d.Type];
  });

  let sortedData = data.toSorted((a, b) => a.Type.localeCompare(b.Type));

  const groupedData = Array.from(
    d3.group(sortedData, (d) => d.Fruit),
    ([Fruit, data]) => ({ Fruit, AvgCost: data[0].AvgCost, Count: data.length })
  );

  groupedData.forEach((d, i) => {
    d.page = page; // Add page number
    if ((i + 1) % 10 == 0) {
      page++;
    }
  });

  for (let i = 1; i <= page; i++) {
    let pageData = groupedData.filter((d) => d.page == i);
    if (pageData.length > 0) {
      pages.push(pageData);
    }
  }

  return pages;
}

/**
 * Event handler for mouseover event on chart arcs.
 * @param {Event} event - The mouseover event object.
 * @param {Object} d - The data object associated with the arc.
 */
function mouseOver(event, d) {
  d3.select(this).transition().duration(500).attr("d", arcHover);

  tooltip.style("opacity", 1);
  tooltip
    .html("Type: " + d.data.Fruit + "<br/>" + "Value: " + d.data.AvgCost)
    .style("left", event.pageX + "px")
    .style("top", event.pageY - 10 + "px");
}

/**
 * Event handler for mouseout event on chart arcs.
 * @param {Event} event - The mouseout event object.
 * @param {Object} d - The data object associated with the arc.
 */
function mouseOut(event, d) {
  d3.select(this).transition().duration(500).attr("d", arc);

  tooltip.style("opacity", 0);
}

/**
 * Event handler for mousemove event on chart arcs.
 * @param {Event} event - The mousemove event object.
 * @param {Object} d - The data object associated with the arc.
 */
function mouseMove(event, d) {
  tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 10 + "px");
}
