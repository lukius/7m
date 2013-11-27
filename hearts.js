var hearts = function() {
	
	var heart_2_clicks = 0;
	
	function uniform_between(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}
	
    function heart_3() {
        // cf. http://www.mathematische-basteleien.de/heart.htm#Calculated Hearts (6)
        var points1 = [];
        var points2 = [];
        d3.range(-2, 2, 0.01)
            .forEach(function(x) {
                var y_1 = Math.sqrt(Math.abs(x)) - Math.sqrt(3 - x*x),
                    y_2 = Math.sqrt(Math.abs(x)) + Math.sqrt(3 - x*x);
                points1.push({'x' : x, 'y' : y_1});
                points2.unshift({'x' : x, 'y' : y_2});
            });
        return points2.concat(points1);
    }
    
    function heart_1() {
        // cf. http://www.mathematische-basteleien.de/heart.htm#Calculated Hearts (3)
        var points = [];
        d3.range(-1, 1, 0.001)
            .forEach(function(t) {
                var abs_t = Math.abs(t),
	                cos_t = Math.cos(t),
	                sin_t = Math.sin(t),
	                x = sin_t * cos_t * Math.log(abs_t),
	                y = Math.sqrt(abs_t) * cos_t;
                points.push({'x':x, 'y':y});
            });
        return points;
    }        
    
    function heart_2() {
        // cf. http://de.wikipedia.org/wiki/Benutzer:Georg-Johann
        var points = [];
        d3.range(-3, 3, 0.1)
            .forEach(function(t) {
                var x = 12*Math.sin(t) - 4*Math.sin(3*t),
                	y = 13*Math.cos(t)- 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
                points.push({'x':x, 'y':y}); 
            });
        return points;
    }    

    function get_heart_curve(transform, generator) {
        var scale = 'scale' in transform ? transform.scale : [1,1],
            translate = 'translate' in transform ? transform.translate : [0,0],
            // Since the browser's coordinate axis is "inverted", the 180 deg rotation puts the heart straight.
            // Adding 180 also makes the rotation clockwise instead of counter-clockwise.
            rotation_deg = 'rotate' in transform ? 180 + transform.rotate : 180,
            rotation_rad = rotation_deg * Math.PI / 180,
            scale_x = scale[0],
            scale_y = scale[1],
            translate_x = translate[0],
            translate_y = translate[1],
            points = generator(),
            mapped_points = [];
            
        points.forEach(function(point) {
	        var x = point.x,
	        	y = point.y,
	        	// y - 0.321: in order to rotate with respect to the center (approx.) of the heart
	        	x_rot = x*Math.cos(rotation_rad) - (y)*Math.sin(rotation_rad),
	            y_rot = x*Math.sin(rotation_rad) + (y)*Math.cos(rotation_rad),
	            x_prime = translate_x + scale_x * x_rot,
	            y_prime = translate_y + scale_y * y_rot;
	        if(!isNaN(x_prime) && !isNaN(y_prime))
	            mapped_points.push({'x' : x_prime , 'y' : y_prime});
        });
        return mapped_points;
    }
    
    function get_svg_path_from(transform, generator) {
    	var curve = d3.svg.line()
						.x(function(d) {return d.x; })
						.y(function(d) {return d.y; })
						.interpolate('linear'),
			points = get_heart_curve(transform, generator);
    	return curve(points);
    }
    
    function draw_heart(svg, transform, generator) {
    	var path = get_svg_path_from(transform, generator);
    	
    	return svg.append('path')
		        .attr('class', 'heart')
		        .attr('fill', 'red')
		        .style('cursor', 'pointer')
		        .attr('d', path);    	
    }
    
    function click_heart(svg, index) {
    	if(index == 1) {
    		var scale = uniform_between(20, 70),
    			random_scale = [scale, scale],
    			random_position = [uniform_between(10, 1200), uniform_between(10, 800)],
    			random_angle = uniform_between(0, 360),
    			transform = {'scale' : random_scale, 'translate' : random_position, 'rotate' : random_angle};
    			draw_heart(svg, transform, heart_1)
    				.attr('class', 'expendable_heart')
    				.attr('fill', 'hsl(' + Math.random()*50 + ',100%,50%)')
    				.on('click', function(d) {
    					d3.selectAll('.expendable_heart')
    						.transition()
    							.style('opacity',0)
    							.remove();
    				});
    	}
    	else if(index == 2) {
    		if(heart_2_clicks >= 3) {
    			d3.selectAll('.expendable_text')
    				.transition()
    					.style('opacity', 0)
    					.remove();
    			heart_2_clicks = 0;
    			return;
    		}
    		
    		var values = [{'text':'Felices','x':0,'color':'black'}, 
    		              {'text':'siete', 'x':440, 'color':'red'},
    		              {'text':'meseees!', 'x':730,'color':'black'}
    		             ],
    			value = values[heart_2_clicks];
    		
    		svg.append('text')
    			.attr('class', 'expendable_text')
    			.attr('x', 2000)
    			.attr('y', 550)
    			.attr('font-family', 'sans-serif')
    			.attr('font-size', 140)
    			.attr('fill', value.color)
    			.style('opacity', 0)
    			.text(value.text)
    			.transition()
    				.attr('x', value.x)
    				.style('opacity', 1)
    				.duration(3000);
    		
    		heart_2_clicks++;
    	}
    	else if(index == 3) {
    		var heart_idx = uniform_between(1, 3),
    			heart = d3.select('#heart' + heart_idx);
    		heart
    			.transition()
    				.duration(2000)
    				.attr('fill', 'hsl(' + Math.random()*50 + ',100%,50%)');
    	}
    }
    
    var hearts = {
        draw : function() {
            var svg = d3.select('#main').append('svg'),
	            heart1_transform = {'scale' : [300,300], 'translate' : [150,300]},
	            heart2_transform = {'scale' : [7,7], 'translate' : [670,190]},
	            heart3_transform = {'scale' : [50,50], 'translate' : [1200,230]},
            	heart1 = draw_heart(svg, heart1_transform, heart_1),
            	heart2 = draw_heart(svg, heart2_transform, heart_2),
            	heart3 = draw_heart(svg, heart3_transform, heart_3);
            
            heart1
            	.datum(heart1_transform)
            	.attr('id', 'heart1')
	            .on('mouseover', function(d) {
	            	var temp_heart = draw_heart(svg, heart1_transform, heart_1);
	            	temp_heart
	            		.on('click', function(d) { click_heart(svg, 1); })
	            		.attr('fill', heart1.attr('fill'))
	            		.transition()
	            			.duration(750)
	            			.attr('d', get_svg_path_from({'scale':[5000,5000], 'translate' : [100,2200]}, heart_1))
	            			.style('opacity', 0)
	            			.remove();
	            })
	            .on('click', function(d) { click_heart(svg, 1); });
            
            heart2
            	.datum(heart2_transform)
            	.attr('id', 'heart2')
            	.on('mouseover', function(d) {
	            	var temp_heart = draw_heart(svg, heart2_transform, heart_2);
	            	temp_heart
	            		.on('click', function(d) { click_heart(svg, 2); })
	            		.attr('fill', heart2.attr('fill'))
	            		.transition()
	            			.duration(750)
	            			.attr('d', get_svg_path_from({'scale':[100,100], 'translate' : [670,500]}, heart_2))
	            			.style('opacity', 0)
	            			.remove();
	            })
	            .on('click', function(d) { click_heart(svg, 2); }); 
            
            heart3
            	.datum(heart3_transform)
            	.attr('id', 'heart3')
            	.on('mouseover', function(d) {
	            	var temp_heart = draw_heart(svg, heart3_transform, heart_3);
	            	temp_heart
	            		.on('click', function(d) { click_heart(svg, 3); })
	            		.attr('fill', heart3.attr('fill'))
	            		.transition()
	            			.duration(750)
	            			.attr('d', get_svg_path_from({'scale':[1000,1000], 'translate' : [1200,950]}, heart_3))
	            			.style('opacity', 0)
	            			.remove();
	            })
	            .on('click', function(d) { click_heart(svg, 3); });
            
        }
    };

    return hearts;
}();
