const width = window.innerWidth - 20;
const height = window.innerHeight - 20;
const radius = Math.min(width, height) / 2 - 50;
const tooltip = d3.select("#tooltip");

//create a pages array
let page = 1;
let currentPage = 0;
let pages = [];
let filteredData;
let csvData;
let arc;
let arcHover;
let outerArc;

//load the data and store it in a variable
d3.csv("FruitTest20240401.csv").then((data) => {
  //filter the data
  filteredData = dataFilter(data);

  buildChart(filteredData[currentPage]);
});

//add button that will change page

d3.select("body")
  .append("button")
  .attr("id", "nextButton")
  .text("Next Page")
  .on("click", () => {
    currentPage++;
    let pageCounter = pages.length - 1;
    if (currentPage > pageCounter) {
      currentPage = pageCounter;
    }
    d3.select("svg").selectAll("*").remove();
    //clear the svg
    filteredData = pages[page - 1];
    buildChart(filteredData);

    if (currentPage >= 1) {
      d3.select("button#prevButton").style("display", "block");
    }

    if (currentPage >= pages.length - 1) {
      d3.select("button#nextButton").style("display", "none");
    }
  });

//add button that will change pag
d3.select("body")
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

    //clear the svg
    filteredData = pages[currentPage - 1];

    buildChart(filteredData);

    //hide button if on first page
    if (currentPage == 1) {
      d3.select("button#prevButton").style("display", "none");
    }

    if (currentPage == 1) {
      d3.select("button#nextButton").style("display", "block");
    }
  });

//Functions

// Load the data
function buildChart(filteredData) {
  //build chart her
  const svg = d3.select("#mySvg").attr("width", width).attr("height", height);

  let g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  let pie = d3.pie().value((d) => d.AvgCost)(filteredData);

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
      //check if the label is on the right side or left side
      var midPoint = [outerArc.centroid(d)[0], outerArc.centroid(d)[1]+d.bottom+5];
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      var x;
      if( midAngle > Math.PI)
        {
          x = outerArc.centroid(d)[0]-d.length
        }
        else {
          x = outerArc.centroid(d)[0]+d.length
        }
      var endingPoint = [x, outerArc.centroid(d)[1]+d.bottom+5];
    return [startingPoint,midPoint, endingPoint];
  
    })
    .attr("stroke", "black")
    .attr("fill", "none");

  //g.append("path").attr("d", outerArc).attr("class", "outerArc");
}
function dataFilter(data) {
  // Filter the data
  data = data.filter((d) => {
    return d.Type == "Citrus";
  });

  let sortedData = data.sort((a, b) => a.Fruit.localeCompare(b.Fruit));

  //add a page column and we will break the data into pages of 10
  sortedData.forEach((d, i) => {
    d.AvgCost = +d.AvgCost; // Convert to number

    d.page = page; // Add page number
    if ((i + 1) % 10 == 0) {
      page++;
    }
    /*****************************/
  });

  //create pages
  for (let i = 1; i <= page; i++) {
    let pageData = sortedData.filter((d) => d.page == i);
    pages.push(pageData);
  }

  return pages;
}

function mouseOver(event, d) {
  d3.select(this).transition().duration(500).attr("d", arcHover);

  tooltip.style("opacity", 1);
  tooltip
    .html(
      "Category: " +
        d.data.Fruit +
        "<br/>" +
        d.data.Type +
        "<br/>" +
        "Value: " +
        d.data.AvgCost
    )
    .style("left", event.pageX + "px")
    .style("top", event.pageY - 10 + "px");
}

function mouseOut(event, d) {
  d3.select(this).transition().duration(500).attr("d", arc);

  tooltip.style("opacity", 0);
}

function mouseMove(event, d) {
  // Update tooltip position
  tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 10 + "px");
}
