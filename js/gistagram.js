var Migstagram = function(){

    var that = this;
    
    var reader = new FileReader();
    var cnv = document.getElementById('editting_canvas');
    var ctx = cnv.getContext('2d');

    this.originalImageData = null;
    this.previousImageData = null;


    reader.onload = function(e) {
        var img = new Image();
        //Create function that processes the image for when the image is loaded
        img.onload = function(the_img) {
            return function(){
                ctx.fillStyle = 'black';
                ctx.fillRect(0,0,cnv.width, cnv.height);
                //Check if the user doesn't want to resize the image
                if (document.getElementById('noScale').checked) {
                    cnv.width = the_img.width;
                    cnv.height = the_img.height;
                    ctx = cnv.getContext('2d');
                    ctx.drawImage(the_img, 0, 0, the_img.width, the_img.height);
                    //TODO change the canvas size
                } else {
                    //Calculate new proportions and offset
                    var new_height, new_width, ratio, x_offset, y_offset;
                    if ( the_img.width > the_img.height ) {
                        ratio = the_img.width / cnv.width;
                        new_height = the_img.height / ratio;
                        new_width = cnv.width;
                        x_offset = 0;
                        y_offset = (cnv.height - new_height)/2;
                    } else {
                        ratio = the_img.height / cnv.height;
                        new_height = cnv.height;
                        new_width = the_img.width / ratio;
                        y_offset = 0;
                        x_offset = (cnv.width - new_width)/2;
                    }
                    ctx.drawImage(the_img, x_offset, y_offset, new_width, new_height);
                }
                that.originalImageData = ctx.getImageData(0,0,cnv.width,cnv.height);
            };
        }(img);
        img.src = e.target.result;
    }; 


    /*
     * TODO * Add parameter for crop or stretch
     */

    /**
     * change a pixel in a imagedata structure
     */
    var setPixel = function(imageData, x, y, rgba) {
        index = (x + y * imageData.width) * 4;
        imageData.data[index+0] = rgba.r;
        imageData.data[index+1] = rgba.g;
        imageData.data[index+2] = rgba.b;
        imageData.data[index+3] = rgba.a;
    }

    /**
     * read a pixel in a imagedata structure
     */
    var getPixel = function(imageData, x, y) {
        index = (x + y * imageData.width) * 4;
        return {
            r:imageData.data[index+0]
            ,g:imageData.data[index+1]
            ,b:imageData.data[index+2]
            ,a:imageData.data[index+3]
        };
    }



    /**
     * Read the files from the element
     */
    this.updatePic = function(files){
        var newPic;
        //Check that there are files
        if (files && files.length>0) {
            newPic = files[0];
            //Check that it's a file
            if (
                    newPic.type != "image/jpeg" &&
                    newPic.type != "image/jpg"  &&
                    newPic.type != "image/png"  &&
                    newPic.type != "image/gif"
               ) {
                   alert ('Only images, please');
                   return;
               }
            //Convert the pic to base64 url data
            reader.readAsDataURL(newPic);

        } else { //There were no files or FileReader is not supported
            console.log("no files :'(");
            return;
        }
    }

    this.undo = function()
    {
        ctx.putImageData(that.previousImageData, 0, 0);
    }

    this.resetPicture = function()
    {
        ctx.putImageData(that.originalImageData, 0, 0);
    }

    this.save = function()
    {
        document.location.href = cnv.toDataURL("image/jpeg");
    }

    this.callFilter = function(filterName, params, cb) {
        that.previousImageData = ctx.getImageData(0,0,cnv.width, cnv.height);
        if ( typeof that.filters[filterName] == 'function' ) {
            that.filters[filterName](params, cb);
        } else {
            console.log('Effect '+effect+ ' not available');
        }
    }


    this.filters = {
        //params is r g or b, the reference channel, defaults to an average of the 3
        'bw': function(params, cb) {
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0, ref = 0;
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    if ( params ) {
                        ref = pixel[params];
                    }
                    if ( params != false && typeof pixel[params] != "undefined") {
                        ref = pixel[params];
                    }else{
                        ref = (pixel.r + pixel.g + pixel.b)/3;
                    }
                    pixel.r = pixel.g = pixel.b = ref;
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        },
        'bayer': function(params, cb) {
            //Now apply
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var aa, ab, ba, bb;
            for ( var _x = 1 ; _x <= cnv.width ; _x += 2 ) {
                for ( var _y = 1 ; _y <= cnv.height ; _y += 2 ) {
                    // Process following this pattern
                    // RG -> {aa}{ab}
                    // GB -> {ba}{bb}
                    //Calculate green:
                    aa = getPixel(imageData, _x,    _y);
                    ab = getPixel(imageData, _x+1,  _y);
                    ba = getPixel(imageData, _x,    _y+1);
                    bb = getPixel(imageData, _x+1,  _y+1);

                    //Blue
                    ab.b = ba.b = bb.b = aa.b;
                    //Red
                    aa.r = ba.r = ab.r = bb.r;
                    //Green
                    aa.g = bb.g = parseInt((ab.g + ba.g)/2);

                    //console.log(np.r+','+np.g+','+np.b);
                    setPixel(imageData, _x,   _y,   aa);
                    setPixel(imageData, _x+1, _y,   ab);
                    setPixel(imageData, _x,   _y+1, ba);
                    setPixel(imageData, _x+1, _y+1, bb);
                }
            }
            ctx.putImageData(imageData, 0, 0);ab.rl
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        },
        'sepia': function(params, cb) {
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0;
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    pixel.r = pixel.g = pixel.b = Math.min(255, pixel.b);
                    pixel.r = 40+pixel.r;//it'll automatically set it to 255 if higher
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        }
        ,'crossColour': function(params, cb) {
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0;
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    //cross-colour processing
                    //http://en.wikipedia.org/wiki/Cross_processing
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
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            //normalise
            //TODO extract into another function with an optional "max"
            var normalise_ratio = 255/max;
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    pixel.r = Math.min(255, pixel.r * normalise_ratio);
                    pixel.g = Math.min(255, pixel.g * normalise_ratio);
                    pixel.b = Math.min(255, pixel.b * normalise_ratio);
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        }
        ,'pixelate': function(params, cb) {
            //Parse parameters
            var pixel_size  = parseInt(params[0]);
            var halfpixel_size = Math.floor(pixel_size);

            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0;

            for ( var _x = 0 ; _x < cnv.width ; _x += pixel_size ) {
                for ( var _y = 0 ; _y < cnv.height ; _y += pixel_size ) {

                    //initialise
                    tmp_avg = new_r = new_g = new_b = 0;
                    //calculate average halfpixel_size around
                    for (__x = _x - pixel_size/2 ; __x < _x + pixel_size/2 ; __x ++ ) {
                        for (__y = _y - pixel_size/2 ; __y < _y + pixel_size/2 ; __y ++ ) {
                            pixel = getPixel(imageData, _x,_y);
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
                            setPixel(imageData, __x, __y, pixel);
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        }
        ,'blur': function(params, cb) {
            //Parse parameters
            var blur_amount    = Math.max(2,parseInt(params[0]));
            var imageDataIn  = ctx.getImageData(0,0,cnv.width, cnv.height);
            var imageDataOut = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0;

            for ( var _x = 0 ; _x < cnv.width ; _x += 1 ) {
                for ( var _y = 0 ; _y < cnv.height ; _y += 1 ) {

                    //initialise
                    tmp_avg = new_r = new_g = new_b = 0;
                    //calculate average blur_around pixels around
                    for (var __x = _x - blur_amount ; __x < _x + blur_amount ; __x ++ ) {
                        for (var __y = _y - blur_amount ; __y < _y + blur_amount ; __y ++ ) {
                            pixel = getPixel(imageDataIn, __x,__y);
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
                    setPixel(imageDataOut, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageDataOut, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        }
        ,'vignette': function(params, cb) {
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);
            var pixel, new_r, new_g, new_b, tmp_avg, max=0, dist_to_center;
            
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    
                    //Distance from the current pixel to the center
                    dist_to_center = Math.floor(Math.pow(Math.sqrt(
                        Math.abs( _y - cnv.height/2) + 
                        Math.abs( _x - cnv.width/2 )
                    ), 2))/10;

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
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            //perform callback
            if ( typeof cb == "function") {
                cb();
            }
        }
    }
};

