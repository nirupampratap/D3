// Generate the first plot
plotGraph = function (svg, dataset, yKey, yMax, pWidth, pHeight, cStartY, cPadding, graphTitle, axesNames, scaling){

	//Create X axis
	var xScale = d3.scale.linear()
			.domain([0, 10])
			.range([cPadding, pWidth - cPadding]);

	var yScale = d3.scale.linear()
			.domain([0, yMax + 10 - yMax % 10])
			.range([cStartY + pHeight - cPadding, cStartY + cPadding]);

	// Generate the X and Y axis in SVG
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

	//Create X axis
	svg.append("g")
		.attr("class", "axis xaxis"+yKey)
		.attr("transform", "translate(0," + (cStartY + pHeight - cPadding) + ")")
		.call(xAxis);

	xAxisEle = svg.selectAll(".xaxis"+yKey);
        xAxisEle.append("text")
              .attr("dx", pWidth-cPadding)
              .attr("dy", "-1em")
              .text(axesNames[0]);
			
	//Create Y axis
	svg.append("g")
		.attr("class", "axis yaxis"+yKey)
		.attr("transform", "translate(" + cPadding + ",0)")
		.call(yAxis);

        yAxisEle = svg.append("g")
	      .attr("class", "ylabel")
	      .attr("transform", "translate("+(cPadding + 8)+","+(cStartY+cPadding)+") rotate(90)")
	      .append("text")
              .text(axesNames[1]);

	// Add a title to the graph
	svg.append("g")
		.attr("class","title")
	      .attr("transform", "translate("+(pWidth/3 + cPadding)+","+(cStartY+cPadding/2)+")")
	      .append("text")
              .text(graphTitle);

	//Create a group for all the items we create inside the graph
	var group = svg.append("g");

	// selectAll construct will work when there is no "path" element to begin with when combined with data and enter(). Else it will not work
	var points = group.selectAll("path")
			.data(dataset)
			.enter()
			.append("path")
		        .filter(function(d) { return isFinite(d[yKey]) })
			.attr("d", function(d){ 
					if(d.IsGoodRating == 0)
						if(scaling == 0)
							return circle(1,0);
						else
							return circle(d.WinsNoms, 1);
					else 
						if(scaling == 0)
							return cross(1,0);  
						else
							return cross(d.WinsNoms, 1);
					})
			.attr('fill',"#fff")
			.attr('stroke',function(d){ return colorscale(d.IsGoodRating); })
			.attr('stroke-width',1)
			.attr('transform',function(d){ if(isFinite(d[yKey]) === true) return "translate("+xScale(d.imdbRating)+","+yScale(d[yKey])+")"; });	

	// Legend
	var legends = ['Bad Rating', 'Good Rating'];

	var inPadding = 20;
	var smallSqH = 10;
	var legendH = 65;
	var legendW = 150;

	// 1. Legend rectangle
	var lgrp = svg.append("g")
		      .attr("class", "legend");

	var lrect = lgrp.append("rect")
		.attr("class", "legend")
		.attr("height", legendH)
		.attr("width", legendW)
		.attr("fill", "#fff")
		.attr("opacity", 0.8)
		.attr("stroke", "#000")
		.attr('transform', "translate("+ (pWidth+cPadding) +","+ (cStartY + cPadding) +")");

	var lIntSq = svg.append("g")
			.attr("class", "smallbox");

	// .data.enter does not work if we provide "rect", it only works with "path"
	var sqr = lIntSq.selectAll("path")
		       .data(legends)
		       .enter()
		       .append("g")
			.attr("class","internalbox")
			.attr('transform', 
				function(d,i)
				{ 
					if(i == 0 ) return "translate("+ (pWidth+cPadding+inPadding) +","+ (cStartY + inPadding + cPadding) +")";
					else return "translate("+ (pWidth+cPadding+inPadding) +","+ (smallSqH + cStartY + inPadding*1.75 + cPadding) +")";
				})
		       .append("path")
			.attr("d", function(d,i) { if(i ==0) return circle(2,0); else return cross(2,0);})
			.attr("stroke", function(d, i){ return colorscale(i);})
			.attr("fill", "#fff");
	

	var internalbox = svg.selectAll(".internalbox");

	internalbox.append("text")
	      .attr("dx", 12)
	      .attr("dy", ".30em")
	      .text(function(d) { return d; });
};
