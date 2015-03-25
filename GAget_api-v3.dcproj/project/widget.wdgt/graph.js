var Graph = function() {

	// ANIMATION
	var svg,
		maxData,
		linetop,
		SvgHeight,
		SvgWidth,
		values,
		data,
		pding = 12, // padding on all sides of the graph
		period,
		container = $('#graph'),
        type = 'allvisits';

	this.init = function(_data, _type) {
		data = _data;
        type = _type;
		container = $('#graph');
		values = [];

		for (var i = 0; i < data.length; i++) {
			values[i] = data[i].megtekintes;
		}
        
        maxData = Math.max.apply(Math, values); // The biggest number in the data
        if (type == 'visit') {
            // CALCULATING THE TOP LINE FOR THE GRAPH
            linetop = 0; // The biggest round number above maxData

            if (maxData > 10) {
                var decimal = Math.pow(10, (maxData.toString().length - 1));
                linetop = Math.ceil(maxData / decimal) * decimal;
            } else {
                linetop = Math.ceil(maxData / 10) * 10;
            }
        } else
            linetop  = 100;

		// STARTING THE GRAPH
		container.addClass('graph');
		container.html('<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="100%" height="100%" class="' + type + '"></svg>');
		svg = container.find('svg');

		SvgWidth = container.width();
		SvgHeight = container.height();

		this.drawGraph();
		this.initActions();
	};

	// DRAWING THE GRAPH IN STATISTICS
	this.drawGraph = function() {
		var that = this;

		// ALIGNING DATA TO THE GRAPH
		var fixeddata = [];
		for (var j = 0; j < values.length; j++) {
			if (maxData === 0) {
				fixeddata[j] = 0;
			} else {
				fixeddata[j] = Math.round((values[j] / linetop) * 100 * (Math.ceil(SvgHeight - pding * 2) / 100));
			}
		}
		
		period = (SvgWidth - pding * 2) / (values.length - 1); // Calculating the lenght between two dots

		// DRAWING THE PERIOD LINES AND LABELS
		that.drawLine('legend', pding, pding, SvgWidth - pding, pding, null);
		that.drawLine('legend', pding, (SvgHeight / 2), SvgWidth - pding, (SvgHeight / 2), null);

		SvgHeight = SvgHeight - pding; // From this point we don't need the original canvas height.

		// Side labels	
		svg.append('<text x="' + (SvgWidth - pding - 4) + '" y="' + (pding + 10) + '" class="label" text-anchor="end">' + (linetop != 0 ? addCommas(linetop) : "") + (type == 'visit' ? '' : '%') + '</text>');
		svg.append('<text x="' + (SvgWidth - pding - 4) + '" y="' + (SvgHeight / 2 + 17) + '" class="label" text-anchor="end">' + ((linetop / 2) != 0 ? addCommas(linetop / 2) : "") + (type == 'visit' ? '' : '%') + '</text>');

		// Bottom labels
		svg.append('<text x="' + (pding) + '" y="' + (SvgHeight + 4) + '" class="label" text-anchor="start">' + that.niceDate(data[0].datum, false) + '</text>');
		svg.append('<text x="' + (SvgWidth - pding) + '" y="' + (SvgHeight + 4) + '"class="label" text-anchor="end">' + that.niceDate(data[data.length - 1].datum, false) + '</text>');


		// DRAWING THE GRAPH
		var base_x = pding;
		var base_y = SvgHeight - fixeddata[0];

		for (var i = 0; i < values.length; i++) {
		
			if (i > 0) {
				that.drawLine('graph', base_x, base_y, (i * period + pding), (SvgHeight - fixeddata[i]), null);
				that.drawLine('legend_vertical', base_x, 0, base_x, base_y, 'hoverline_' + (i - 1));
			}
			
			that.drawCircle((i * period + pding), (SvgHeight - fixeddata[i]), i);

			base_x = i * period + pding;
			base_y = SvgHeight - fixeddata[i];
			
            if (i == (values.length - 1))
                that.drawLine('legend_vertical', base_x, 0, base_x, base_y, 'hoverline_' + i);
		}
		
		
		// DRAWING INFO BOX
		svg.parent().append('<div class="infobox" id="infobox"><p></p></div>');


		// REARRANGING THE ELEMENTS
		svg.children('circle').each(function() {
			svg.children('line').last().after($(this));
		});

		svg.children('rect.hoverrect').each(function() {
			svg.children().last().after($(this));
		});

		svg.children('g').each(function() {
			svg.children().first().before($(this));
		});

		// REFRESHING THE SVG TO SHOW ELEMENTS
		svg.parent().html(svg.parent().html());
	};

	this.drawLine = function(l_class, x1, y1, x2, y2, id) {
		
		var fixer = 6;
		var fixed_x1 = x1 + Math.cos(Math.atan( (y2 - y1) / (x2 - x1) )) * fixer;
		var fixed_y1 = y1 + Math.sin(Math.atan( (y2 - y1) / (x2 - x1) )) * fixer;
		var fixed_x2 = x2 - Math.cos(Math.atan( (y2 - y1) / (x2 - x1) )) * fixer;
		var fixed_y2 = y2 - Math.sin(Math.atan( (y2 - y1) / (x2 - x1) )) * fixer;
		
		if (id != null)
			var extra = ' id="' + id + '"';
		else
			var extra = '';
			
		if (l_class == 'graph') {
			x1 = fixed_x1;
			y1 = fixed_y1;
			x2 = fixed_x2;
			y2 = fixed_y2;
		}
		
		svg.append('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + l_class + '"' + extra + '></line>');
	};

	this.drawCircle = function(cx, cy, i) {
		svg.append('<circle cx="' + cx + '" cy="' + cy + '" r="4" id="data_' + i + '"></circle>');
		svg.append('<rect x="' + (cx - period / 2) + '" y="0"  width="' + period + '" height="' + (SvgHeight + pding) + '" id="hover_' + i + '" class="hoverrect" date="' + data[i].datum + '" value="' + data[i].megtekintes + '" />');
	};

	// FUNCTION FOR FORMATTING DATES
	this.niceDate = function(dateStr, needDay) {
		var nicedate = new Date(dateStr);
		//var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var day = days[nicedate.getDay()];
		
		if (needDay)
			return day + ' (' + months[nicedate.getMonth()] + ' ' + nicedate.getDate() + ')';
		else
			return months[nicedate.getMonth()].substring(0, 3) + ' ' + nicedate.getDate();
	};
	
	this.infoBox = function(id) {
		var that = this;
		
		$('#infobox').hide();
		container.find('circle').attr('r', '4');
		$('line.legend_vertical').hide();
		
		if (id !== null) {
			var obj = $('#' + id);
	
			var circle = $('circle#data_' + id.replace('hover_', ''));
			circle.attr('r', '6');
			
			$('line.legend_vertical').hide();
			$('line#hoverline_' + id.replace('hover_', '')).show();
			
			$('#infobox p').html('<b>' + addCommas(obj.attr('value')) + (type == 'visit' ? ' visits' : '%') + '</b><span>' + that.niceDate(obj.attr('date'), true) + '</span>');
			
			var info_x = parseInt(circle.attr('cx')) - 50;
			if (info_x > 280) info_x = 280;
			else if (info_x < 3) info_x = 3;
	
			$('#infobox').css({'left': info_x}).show();
		}
	}
	
	this.initActions = function() {
		var that = this;
		
		$('rect.hoverrect', container).on("hover", function(e) {
			that.infoBox($(this).attr('id'));
		});
		
		$('svg').mouseleave(function() {
			that.infoBox(null);
		});
	}
};