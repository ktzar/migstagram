var MigstagramFilters = {
    //params is r g or b, the reference channel, defaults to an average of the 3
    'bw': function(params, cb) {
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0, ref = 0;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                if ( params ) {
                    ref = pixel[params];
                }
                if ( params != false && typeof pixel[params] != "undefined") {
                    ref = pixel[params];
                }else{
                    ref = (pixel.r + pixel.g + pixel.b)/3;
                }
                pixel.r = pixel.g = pixel.b = ref;
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    },
    'bayer': function(params, cb) {
        //Now apply
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var aa, ab, ba, bb;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x += 2 ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y += 2 ) {
                // Process following this pattern
                // RG -> {aa}{ab}
                // GB -> {ba}{bb}
                //Calculate green:
                aa = this.getPixel(imageData, _x,    _y);
                ab = this.getPixel(imageData, _x+1,  _y);
                ba = this.getPixel(imageData, _x,    _y+1);
                bb = this.getPixel(imageData, _x+1,  _y+1);
                aa.b = bb.b;
                aa.g = parseInt((ab.g + ba.g)/2);
                //Scaled down by 2
                this.setPixel(imageData, _x/2,   _y/2,   aa);
            }
        }
        //Scaled down by 2
        this.cnv.height /= 2; this.cnv.width /= 2;
        this.ctx.putImageData(imageData, 0, 0);
    },
    'sepia': function(params, cb) {
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                pixel.r = pixel.g = pixel.b = Math.min(255, pixel.b);
                pixel.r = 40+pixel.r;//it'll automatically set it to 255 if higher
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
    //cross-colour processing
    //http://en.wikipedia.org/wiki/Cross_processing
    ,'crossColour': function(params, cb) {
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                new_r = params[0]*Math.sin(pixel.r/41)+1.2*pixel.r;
                new_g = params[1]*Math.sin(pixel.g/41)+1.2*pixel.g;
                new_b = params[2]*Math.sin(pixel.b/41)+1.2*pixel.b;
                tmp_avg = (new_r + new_g + new_b) / 3;
                if ( (new_r + new_g + new_b) / 3 > max ) {
                    max = tmp_avg;
                } 
                pixel.r = Math.min(255, new_r);
                pixel.g = Math.min(255, new_g);
                pixel.b = Math.min(255, new_b);
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        //normalise
        //TODO extract into another function with an optional "max"
        var normalise_ratio = 255/max;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                pixel.r = Math.min(255, pixel.r * normalise_ratio);
                pixel.g = Math.min(255, pixel.g * normalise_ratio);
                pixel.b = Math.min(255, pixel.b * normalise_ratio);
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
    ,'pixelate': function(params, cb) {
        //Parse parameters
        var pixel_size  = parseInt(params[0]);
        var halfpixel_size = Math.floor(pixel_size);
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x += pixel_size ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y += pixel_size ) {
                //initialise
                tmp_avg = new_r = new_g = new_b = 0;
                //calculate average halfpixel_size around
                for (__x = _x - pixel_size/2 ; __x < _x + pixel_size/2 ; __x ++ ) {
                    for (__y = _y - pixel_size/2 ; __y < _y + pixel_size/2 ; __y ++ ) {
                        pixel = this.getPixel(imageData, _x,_y);
                        new_r += pixel.r;
                        new_g += pixel.g;
                        new_b += pixel.b;
                        tmp_avg ++;
                    }
                }
                //The chosen colour
                new_r /= tmp_avg; new_g /= tmp_avg; new_b /= tmp_avg;
                pixel.r = new_r; pixel.g = new_g; pixel.b = new_b;
                //Set it in the surrounding pixels
                for (__x = _x - pixel_size/2 ; __x < _x + pixel_size/2 ; __x ++ ) {
                    for (__y = _y - pixel_size/2 ; __y < _y + pixel_size/2 ; __y ++ ) {
                        this.setPixel(imageData, __x, __y, pixel);
                    }
                }
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
    ,'blur': function(params, cb) {
        //Parse parameters
        var blur_amount    = Math.max(2,parseInt(params[0]));
        var imageDataIn  = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var imageDataOut = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x += 1 ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y += 1 ) {
                //initialise
                tmp_avg = new_r = new_g = new_b = 0;
                //calculate average blur_around pixels around
                for (var __x = _x - blur_amount ; __x < _x + blur_amount ; __x ++ ) {
                    for (var __y = _y - blur_amount ; __y < _y + blur_amount ; __y ++ ) {
                        pixel = this.getPixel(imageDataIn, __x,__y);
                        new_r += pixel.r;
                        new_g += pixel.g;
                        new_b += pixel.b;
                        tmp_avg ++;
                    }
                }
                //The chosen colour
                new_r /= tmp_avg; new_g /= tmp_avg; new_b /= tmp_avg;
                pixel.r = new_r;pixel.g = new_g; pixel.b = new_b;
                //Set it in the surrounding pixels
                this.setPixel(imageDataOut, _x, _y, pixel);
            }
        }
        this.ctx.putImageData(imageDataOut, 0, 0);
    }
    ,'vignette': function(params, cb) { 
        //accepted params: diamond, rectangle
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0, dist_to_center;
        var darkenFn;
        if (params == "diamond") {
            darkenFn = function(x,y){
                return Math.floor(
                    Math.pow(Math.sqrt(
                        Math.abs( y - this.cnv.height/2) + 
                        Math.abs( x - this.cnv.width/2 )
                    ), 2)
                )/8;
            };
        }else if(params == "rectangle") {
            darkenFn = function(x,y){
                return Math.max(
                    0,
                    255-x,
                    255-y,
                    255-Math.abs(this.cnv.width-x),
                    255-Math.abs(this.cnv.height-y)
                );
            };
        }
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                //Distance from the current pixel to the center
                dist_to_center = darkenFn(_x,_y);
                new_r = pixel.r - dist_to_center;
                new_g = pixel.g - dist_to_center;
                new_b = pixel.b - dist_to_center;
                tmp_avg = (new_r + new_g + new_b) / 3;
                if ( (new_r + new_g + new_b) / 3 > max ) {
                    max = tmp_avg;
                } 
                pixel.r = Math.min(255, new_r);
                pixel.g = Math.min(255, new_g);
                pixel.b = Math.min(255, new_b);
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
    ,'flip': function(params, cb) {
        var imageDataIn  = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var imageDataOut = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel;
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageDataIn, _x,_y);
                if ( params == "vertical" ) {
                    this.setPixel(imageDataOut, _x, this.cnv.height-_y, pixel);
                } else {
                    this.setPixel(imageDataOut, this.cnv.width-_x, _y, pixel);
                }
            }
        }
        this.ctx.putImageData(imageDataOut, 0, 0);
    },
    'autolevels': function(params, cb) {
        var imageData = this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height);
        var pixel;
        //minimum and maximum found values
        var min = {r:0, g:0, b:0};
        var max = {r:0, g:0, b:0};
        var pixel_size = 45; //averaging to avoid peaks of white or black
        //Look for maximum and minimum R, G and B values by averaging blocks
        for ( var _x = 0 ; _x <= this.cnv.width ; _x += pixel_size ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y += pixel_size ) {
                //initialise
                tmp_avg = 0;
                var new_pixel = {r:0,g:0,b:0};
                //calculate average pixel_size/2 px around
                for (__x = _x - pixel_size/2 ; __x < _x + pixel_size/2 ; __x ++ ) {
                    for (__y = _y - pixel_size/2 ; __y < _y + pixel_size/2 ; __y ++ ) {
                        pixel = this.getPixel(imageData, _x,_y);
                        new_pixel.r += pixel.r;
                        new_pixel.g += pixel.g;
                        new_pixel.b += pixel.b;
                        tmp_avg ++;
                    }
                }
                //The chosen colour
                for(var channel in pixel) {
                    new_pixel[channel] /= tmp_avg;
                    if (new_pixel[channel] > max[channel]) {
                        max[channel] = new_pixel[channel];
                    }
                    if (new_pixel[channel] < min[channel]) {
                        min[channel] = new_pixel[channel];
                    }
                }
            }
        }
        var offsets = min;
        var scales  = {
            r: 255/(max.r-min.r),
            g: 255/(max.g-min.g),
            b: 255/(max.b-min.b)
        };
        console.log(scales);
        //Now, expand every channel with the calculated offset and scale
        for ( var _x = 0 ; _x <= this.cnv.width ; _x ++ ) {
            for ( var _y = 0 ; _y <= this.cnv.height ; _y ++ ) {
                pixel = this.getPixel(imageData, _x,_y);
                pixel.r = parseInt((pixel.r*scales.r) + offsets.r);
                pixel.g = parseInt((pixel.g*scales.g) + offsets.g);
                pixel.b = parseInt((pixel.b*scales.b) + offsets.b);
                this.setPixel(imageData, _x, _y, pixel);
            }
        }
        console.log('Max', max);
        console.log('Min', min);
        this.ctx.putImageData(imageData, 0, 0);
    },
};
