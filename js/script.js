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


$(function(){
    /**
     * Click handler for the buttons
     */
    $('.controls button').click(function(){
        var effect = $(this).attr('data-filter');
        var params = $(this).attr('data-filter-param').split(',');

        if (typeof filters[effect] != "function" ) {
            console.log('Effect '+effect+ ' not available');
        }else{
            filters[effect](params, function(){
                console.log('Effect '+effect+' finished');
            });
        }
    });
});
