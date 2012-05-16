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


/**
 * Process an imageData
 */
function processImage(ctx, width, height) {
    var imageData = ctx.getImageData(0,0,width, height);
    var pixel, new_r, new_g, new_b, tmp_avg, max=0;
    for ( var _x = 0 ; _x < width -1; _x ++ ) {
        for ( var _y = 0 ; _y < height -1; _y ++ ) {
            pixel = getPixel(imageData, _x,_y);
            //cross-colour processing
            new_r = 30*Math.sin(pixel.r/41)+1.2*pixel.r;
            new_g = -20*Math.sin(pixel.g/41)+1.2*pixel.g;
            new_b = 10*Math.sin(pixel.b/41)+1.2*pixel.b;

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
}

var reader = new FileReader();
reader.onload = function(e) {
    var img = new Image();
    //Create function that processes the image for when the image is loaded
    img.onload = function(the_img) {
        return function(){
            var cnv = document.getElementById('editting_canvas');
            var ctx = cnv.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0,0,cnv.width, cnv.height);
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
            processImage(ctx, cnv.width, cnv.height);
        };
    }(img);
    img.src = e.target.result;
}; 

/**
 * Read the files from the element
 */
function updatePic(files){
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
