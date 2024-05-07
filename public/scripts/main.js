const width = window.innerWidth - 20;
const height = window.innerHeight - 20;
const radius = Math.min(width, height) / 2;
const tooltip = d3.select("#tooltip");

//create a pages array
let page = 1;
let currentPage = 0;
let pages = [];
let filteredData;

//add button that will change page
d3.select("body")
  .append("button")
  .text("Next Page")
  .on("click", () => {
    currentPage++;
    if (currentPage > pages.length) {
      currentPage = 1;
    }
    //clear the svg
    filteredData = pages[page - 1];
    updateChart();
  });


function updateChart() {
  const svg = d3.select("#mySvg").attr("width", width).attr("height", height);

  // Clear the SVG
  svg.selectAll("*").remove();

  let g = svg
    .select("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  let pie = d3.pie().value((d) => d.AvgCost)(filteredData);

  let arc = d3
    .arc()
    .innerRadius(radius / 2)
    .outerRadius(radius);

  let arcHover = d3
    .arc()
    .innerRadius(radius / 2 - 10)
    .outerRadius(radius + 20);

  let arcs = g
  .selectAll(".arc") // Changed "arc" to ".arc"
  .data(pie)
  .enter()
  .append("g")
  .attr("class", "arc"); // Added this line

  arcs.select("path").attr("d", arc);

  arcs
    .select("text")
    .attr("transform", function (d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("dy", "0")
    .text(function (d) {
      return d.data.Fruit;
    });
}
//load the data and store it in a variable
let csvData = d3.csv("FruitTest20240401.csv").then((data) => {
  return data;
});


// Load the data
d3.csv("FruitTest20240401.csv").then((data) => {
  //manipulate data here
  filteredData = dataFilter(data);

  //build chart her
  const svg = d3.select("#mySvg").attr("width", width).attr("height", height);

  let g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  let pie = d3.pie().value((d) => d.AvgCost)(filteredData[0]);

  let arc = d3
    .arc()
    .innerRadius(radius / 2)
    .outerRadius(radius);

  let arcHover = d3
    .arc()
    .innerRadius(radius / 2 - 10)
    .outerRadius(radius + 20);

  let arcs = g
    .selectAll(".arc") // Changed "arc" to ".arc"
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "arc"); // Added this line

  arcs
    .append("path")
    .attr("fill", (d, i) => {
      return d3.schemeSet3[i % d3.schemeSet3.length]; // Added modulus operation to avoid going out of bounds
    })
    .attr("d", arc)
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut);

  arcs
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("dy", "0")
    .text(function (d) {
      return d.data.Fruit;
    });

  function dataFilter(data) {
    // Filter the data
    let filteredData = data.filter((d) => {
      return d.Type == "Citrus";
    });

    let sortedData = filteredData.sort((a, b) =>
      a.Fruit.localeCompare(b.Fruit)
    );

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

    console.log(pages);

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
});
