
// Books in their order of printing
var gData = [{city: 'San Antonio', population_2012: 1383505, growth: {year_2013:25405, year_2014:26644 , year_2015:28593 , year_2016:23591 , year_2017:24208}},
{city: 'New York', population_2012: 8383504, growth: {year_2013:75138 , year_2014:62493 , year_2015:61324 , year_2016:32967 , year_2017:7272}},
{city: 'Chicago', population_2012: 2717989, growth: {year_2013:6493 , year_2014:2051 , year_2015:-1379 , year_2016:-4879 , year_2017:-3825}},
{city: 'Los Angeles', population_2012: 3859267, growth:{year_2013:32516 , year_2014:30885 , year_2015:30791 , year_2016:27657 , year_2017:18643}},
{city: 'Phoenix', population_2012: 1495880, growth: {year_2013:25302 , year_2014:26547 , year_2015:27310 , year_2016:27003 , year_2017:24036}}
];

var gSvg;

//set default dimensions
var canvasH = 500, canvasW = 1200, plotW = 600;

function onhover() {
	hoverNode = d3.select(this);
	hoverNode.attr("fill", "#00c2f6");

        dataset = prcsSmlGph(hoverNode.property("id"));

        plotGraph(gSvg, dataset, graphTitle=[], axesNames=[], scaling=1);
};

function onmouseout() {
	hoverNode = d3.select(this)

	hoverNode.attr("fill", "#aba7a2");

	d3.selectAll("#smallgraph").remove();
};

// Sort comparison function
compare = function (a,b) {

  if (a.cupop > b.cupop)
    return -1;
  if (a.cupop < b.cupop)
    return 1;

  return 0;
};

prcsSmlGph = function(cityName) {

	var data = gData;
	var returnData = [];
	var cuPop = 0;

	for(let i=0;i<data.length;i++){
		if(data[i].city == cityName){

			cuPop = data[i].population_2012;

			// 2013
			returnData[0] = {};
			returnData[0].year = 2013;
			returnData[0].grpct = data[i].growth.year_2013 / cuPop * 100;
			cuPop += data[i].growth.year_2013;

			// 2014
			returnData[1] = {};
			returnData[1].year = 2014;
			returnData[1].grpct = data[i].growth.year_2014 / cuPop * 100;
			cuPop += data[i].growth.year_2014;

			// 2015
			returnData[2] = {};
			returnData[2].year = 2015;
			returnData[2].grpct = data[i].growth.year_2015 / cuPop * 100;
			cuPop += data[i].growth.year_2015;

			// 2016
			returnData[3] = {};
			returnData[3].year = 2016;
			returnData[3].grpct = data[i].growth.year_2016 / cuPop * 100;
			cuPop += data[i].growth.year_2016;

			// 2017
			returnData[4] = {};
			returnData[4].year = 2017;
			returnData[4].grpct = data[i].growth.year_2017 / cuPop * 100;
			cuPop += data[i].growth.year_2017;
		}
	}

	return returnData;
};

processData = function() {

	var dataset = [];

	for (let i = 0; i<gData.length; i++) {
		var dataItem = {};

		dataItem.city = gData[i].city
		dataItem.cupop = gData[i].population_2012 + gData[i].growth.year_2013 + gData[i].growth.year_2014 + gData[i].growth.year_2015 + gData[i].growth.year_2016 + gData[i].growth.year_2017;

		dataset.push(dataItem);
	}

	return dataset.sort(compare);
};

renderBarChart = function(svg) {

  // Set the global SVG variable first
  gSvg = svg;

  var data = processData();

  var itemSize = 60,
      cellSize = itemSize - 20,
      margin = {top: 50, right: 30, bottom: 30, left: 100};
      
   var y_elements = d3.set(data.map(function( item ) { return item.city; } )).values();
   var y_cuPopEle = d3.set(data.map(function( item ) { return item.cupop; } )).values();

    var yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * itemSize]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");
 
    // ... is spread operator it spreads an array into the item list required for min, max operations
   var max = Math.max(...y_cuPopEle), min = Math.min(...y_cuPopEle);

    var shScale = d3.scale.linear()
	.domain([min,max])
	.range([150,plotW]);
    
    // Translate SVG a bit further into the screen.
    svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g')
	.attr("class","cellparent")
	.attr('transform',function(d){ return 'translate(0,'+yScale(d.city)+')';})
	.append('rect')
        .attr('class', 'cell')
        .attr('width', function(d){ return shScale(d.cupop); })
        .attr('height', cellSize)
	.attr('fill','#aba7a2')
	.attr("id", function(d) { return d.city; })
        .on('mouseover',onhover)
        .on('mouseout',onmouseout);


    // Element d is already with the node. Hence we can directly call like this
    svg.selectAll('.cellparent')
	.append('text')
	.attr("fill", "#fff")
	.attr("y",cellSize/2)
	.attr("dy","0.30em")
	.attr("dx", "1em")
	.text(function(d) {return d.cupop.toLocaleString();});

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
	.attr('fill','#aba7a2')
	.attr("dy","-0.5em")
        .attr('font-weight', 'normal');
};

plotGraph = function (svg, data, graphTitle, axesNames, scaling){

    var cStartX = plotW + 100 + 50, cStartY = 50, cPadding = 30;
    var pWidth = canvasW - cStartX - cPadding, pHeight = canvasH - 200;
    var itemSize = pWidth/5;

// Go for the ordinal scale
    var x_elements = d3.set(data.map(function( item ) { return item.year; } )).values(),
        y_elements = d3.set(data.map(function( item ) { return (item.grpct).toFixed(2); } )).values();

    var xScale = d3.scale.linear()
        .domain([Math.min(...x_elements), Math.max(...x_elements)])
        .range([0, pWidth-cPadding]);

    var yScale = d3.scale.linear()
        .domain([Math.min(...y_elements), Math.max(...y_elements)])
        .range([cStartY+pHeight-cPadding, cStartY]);

// Generate the X and Y axis in SVG
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d")).ticks(5);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

//Create X axis

	svg = svg.append("g")
		 .attr("id", "smallgraph");

	svg.append("g")
		.attr("class", "smalline")
		.attr("transform", "translate(" + cStartX + "," + (cStartY + pHeight - cPadding) + ")")
		.call(xAxis);

	//Create Y axis
	svg.append("g")
		.attr("class", "smalline")
		.attr("transform", "translate(" + cStartX + ",0)")
		.call(yAxis);

	// Add labels
	svg.append("g")
		.attr("class", "axislabel")
		.attr("transform", "translate(" + cStartX + ","+ (cStartY - 5) +")")
		.append("text")
		.attr("dx","-3em")
		.text("Pct %");

	svg.append("g")
		.attr("class", "axislabel")
		.attr("transform", "translate(" + (cStartX + pWidth - cPadding) + ","+ (cStartY + pHeight - cPadding) +")")
		.append("text")
		.attr("dy","3em")
		.text("Year");

	var line = d3.svg.line()
		     .x(function(d) {return xScale(d.year);})
		     .y(function(d) {return yScale(d.grpct);});

	svg.append("path")	
		.attr("class", "graphline")
		.attr("transform", "translate(" + cStartX + ",0)")
		.attr("d", line(data))
		.attr("fill","none")
		.attr("stroke","steelblue");

};
