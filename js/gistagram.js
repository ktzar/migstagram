var Migstagram = function(){

    var that = this;
    
    var reader = new FileReader();
    var cnv = document.getElementById('editting_canvas');
    var ctx = cnv.getContext('2d');
    //Make these available
    that.cnv = cnv;
    that.ctx = ctx;

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
    }; that.setPixel = setPixel;

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
    }; that.getPixel = getPixel;



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

    /**
     * cb callback function when the load is over, contains "error" as a parameter
     */
    this.loadUrl = function(url, cb)
    {
        var img = new Image();
        img.src = 'image_proxy.php?url='+url;
        img.crossorigin = '';
        img.onload = function(){
            console.log(img);
            cnv.width   = img.width;
            cnv.height  = img.height;
            ctx.drawImage(img, 0,0);
            that.originalImageData = ctx.getImageData(0,0,cnv.width,cnv.height);
        }
        if (typeof cb == "function") {
            cb(false);
        }
    }

    this.callFilter = function(filterName, params, cb) {
        //Make sure "cb" is a function
        if (typeof cb != "function") cb = function(){};
        that.previousImageData = ctx.getImageData(0,0,cnv.width, cnv.height);
        if ( typeof that.filters[filterName] == 'function' ) {
            var start = new Date();
            that.filters[filterName].apply(that, [params, cb]);
            var end = new Date();
            console.log("Filter took "+(end-start)+"ms");
            cb(true);
        } else {
            console.log('Effect '+filterName+ ' not available');
            cb(false);
        }
    }

    this.addFilter = function(name, fn){
        this.filters[name] = fn;
    };

    this.filters = { }
};

