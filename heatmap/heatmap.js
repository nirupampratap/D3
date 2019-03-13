
// Books in their order of printing
var harPotBooks = ['Sorcerer\'s Stone','Chamber of Secrets','Prisoner of Azkaban','Goblet of Fire','Order of the Phoenix','Half Blood Prince','Deathly Hallows'];
var hogwartsHouses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
var bookPrintIndex = {};

bookPrintIndex["Sorcerer\'s Stone"] = 1;
bookPrintIndex["Chamber of Secrets"] = 2;
bookPrintIndex["Prisoner of Azkaban"] = 3;
bookPrintIndex["Goblet of Fire"] = 4;
bookPrintIndex["Order of the Phoenix"] = 5;
bookPrintIndex["Half Blood Prince"] = 6;
bookPrintIndex["Deathly Hallows"] = 7;

//set default dimensions
var canvasH = 500, canvasW = 700;

//Global dataset
var gDataSet = [];

setOptions = function(){
	var select = d3.select('#options')
			.append('select')
		  	.attr('class','select')
			.on('change',onchange)

	var options = select
			  .selectAll('option')
		 	  .data(hogwartsHouses).enter()
			  .append('option')
			  .text(function (d) { return d; });
};

function onchange() {
	selectValue = d3.select('select').property('value')

	// Remove the previous canvas
	d3.select("svg").remove();

	// Set the new canvas
	var svg = d3.select('#spellmap')
		.append('svg')
		.attr({'width':canvasW,'height':canvasH});

	// Filter the data
	var data = gDataSet;
	var filteredData = filter(data, selectValue);
	console.log(selectValue);
	renderHeatMap(filteredData, svg);
};

setGlobalData = function(data){
	gDataSet = data;
};

filter = function(data, houseName) {

	var returnData = [];

	for(let i = 0; i<data.length; i++){
		var dataItem = data[i];
		
		if(dataItem.House == houseName){

			for(let j = 0; j < 7; j++){
				var retLineItem = {};
				retLineItem.bookname = harPotBooks[j];
				retLineItem.spellname = dataItem.SpellType;
				retLineItem.spellcount = dataItem[harPotBooks[j]];

				returnData.push(retLineItem);
				retLineItem = {};
			}
		}

	}

	return returnData.sort(compare);
};

// Sort comparison function
compare = function (a,b) {

  if (a.spellname < b.spellname)
    return -1;
  if (a.spellname > b.spellname)
    return 1;

  return 0;
}


renderHeatMap = function(data, svg) {
  var itemSize = 44,
      cellSize = itemSize - 1,
      margin = {top: 50, right: 30, bottom: 30, left: 150};
      
    var x_elements = d3.set(data.map(function( item ) { return item.spellname; } )).values(),
        y_elements = d3.set(data.map(function( item ) { return item.bookname; } )).values();

    var xScale = d3.scale.ordinal()
        .domain(x_elements)
        .rangeBands([0, x_elements.length * itemSize]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("bottom");

    var yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * itemSize]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");

    // Define color scales - First calculate the stepsizes
    var min = data[0].spellcount, max = 0, stepSize = 0;

    for(let i = 0; i< data.length;i++){
	if(data[i].spellcount > max) max = data[i].spellcount;
	if(data[i].spellcount < min) min = data[i].spellcount;
    }

    stepSize = (max - min)/7;

    var colorScale = d3.scale.threshold()
        .domain([min,min+0.5*stepSize, min+1*stepSize, min+1.5*stepSize, min+2.5*stepSize, min+4*stepSize, min+5*stepSize,max])
        .range(["#fff7f1", "#ffe0d8", "#ffc3b7", "#ff97a9", "#ff5992","#f70489", "#c80071", "#89006d", "#510063"]);

    // Translate SVG to a bit further into the screen.
    svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g').append('rect')
        .attr('class', 'cell')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', function(d) { return yScale(d.bookname); })
        .attr('x', function(d) { return xScale(d.spellname); })
    	.attr("rx", 5)
	.attr("ry", 5)
        .attr('fill', function(d) { return colorScale(d.spellcount); });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

   svg.append("g")
      .attr("class", "axislabel")
      .append("text")
      .attr("dx", "-3em")
      .attr("dy", "-0.5em")
      .text("Book");

    svg.append("g")
        .attr("class", "x axis")
	.attr("transform", "translate(0," + (itemSize * 7)  +")")
        .call(xAxis)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "-0.5em")
        .attr("transform", function (d) {
            return "rotate(270)";
        });
   
     svg.append("g")
      .attr("class", "axislabel")
      .attr("transform", "translate("+ (x_elements.length * itemSize)  +"," + (itemSize * 7)  +")")
      .append("text")
      .attr("dx", "0.35em")
      .attr("dy", "1.2em")
      .text("Spell Type");


// Add the legend
    var legendDomain = [min,min+0.5*stepSize, min+1*stepSize, min+1.5*stepSize, min+2.5*stepSize, min+4*stepSize, min+5*stepSize,max];
    var leg_elements = d3.set(legendDomain.map(function( item ) { return Math.round(item); } )).values();

    var legSize = 30;

    var legScale = d3.scale.ordinal()
        .domain(leg_elements)
        .rangeBands([0, leg_elements.length * legSize]);

    var legAxis = d3.svg.axis()
        .scale(legScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");

     var legend = svg.append("g")
        .attr("transform", "translate(" + (1.5+x_elements.length) * itemSize + ",0)");

    legend.append("g")
        .attr("class", "y axis")
        .call(legAxis)
        .selectAll('text')
	.attr("class","legaxis")
	.attr('dx','0.375em')
	.attr('dy','1.8em');

// Add color scale

   var legColorScale = d3.scale.linear()
	.domain([1,2,3,4,5,6,7,8,9])
	.range(["#fff7f1", "#ffe0d8", "#ffc3b7", "#ff97a9", "#ff5992","#f70489", "#c80071", "#89006d", "#510063"]);

    var legendCells = legend.selectAll("rect") 
        .data([1,2,3,4,5,6,7,8,9])
        .enter().append('g').append('rect')
        .attr('class', 'legCell')
        .attr('width', legSize/2)
        .attr('height', legSize)
	.attr('fill', function(d){ return legColorScale(d); } )
	.attr("transform", function(d, i){ return "translate(0,"+(i*legSize)+")";});

// Add the legend for text

     var legendText = svg.append("g")
        .attr("transform", "translate(" + ((1.5+x_elements.length) * itemSize + legSize/2 + 8) + ",0)")
	.attr("class","axislabel")
	.append("text")
	.text("No. of Spells")
	.attr("transform","rotate(90)");
};
