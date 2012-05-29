
/*
 * TODO: add 3 or 4 preset params of cross processing
 * Add parameter for crop or stretch
 */

/**
 * change a pixel in a imagedata structure
 */
function setPixel(imageData, x, y, rgba) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = rgba.r;
    imageData.data[index+1] = rgba.g;
    imageData.data[index+2] = rgba.b;
    imageData.data[index+3] = rgba.a;
}

/**
 * read a pixel in a imagedata structure
 */
function getPixel(imageData, x, y) {
    index = (x + y * imageData.width) * 4;
    return {
        r:imageData.data[index+0]
        ,g:imageData.data[index+1]
        ,b:imageData.data[index+2]
        ,a:imageData.data[index+3]
    };
}


var filters = {
/**
 * Process an imageData
 */
    'crossColour': function(params, cb) {
        var cnv = document.getElementById('editting_canvas');
        var ctx = cnv.getContext('2d');
        var width = cnv.width;
        var height = cnv.height;
        console.log(params);

        var imageData = ctx.getImageData(0,0,width, height);
        var pixel, new_r, new_g, new_b, tmp_avg, max=0;
        for ( var _x = 0 ; _x < width -1; _x ++ ) {
            for ( var _y = 0 ; _y < height -1; _y ++ ) {
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
        for ( var _x = 0 ; _x < width -1; _x ++ ) {
            for ( var _y = 0 ; _y < height -1; _y ++ ) {
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
}
