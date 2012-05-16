

function setPixel(imageData, x, y, rgba) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = rgba.r;
    imageData.data[index+1] = rgba.g;
    imageData.data[index+2] = rgba.b;
    imageData.data[index+3] = rgba.a;
}
function getPixel(imageData, x, y) {
    index = (x + y * imageData.width) * 4;
    return {
        r:imageData.data[index+0]
        ,g:imageData.data[index+1]
        ,b:imageData.data[index+2]
        ,a:imageData.data[index+3]
    };
}

var reader = new FileReader();
reader.onload = function(e) {
    var img = new Image();
    img.onload = function(the_img) {
        return function(){
            var cnv = document.getElementById('editting_canvas');
            var ctx = cnv.getContext('2d');
            ctx.drawImage(the_img, 0, 0, cnv.width, cnv.height);
            var imageData = ctx.getImageData(0,0,cnv.width, cnv.height);

            var pixel;
            for ( var _x = 0 ; _x < cnv.width -1; _x ++ ) {
                for ( var _y = 0 ; _y < cnv.height -1; _y ++ ) {
                    pixel = getPixel(imageData, _x,_y);
                    pixel.r = Math.min(255,pixel.r + 40);
                    setPixel(imageData, _x, _y, pixel);
                }
            }
            ctx.putImageData(imageData, 0, 0);
        };
    }(img);
    img.src = e.target.result;
    //aImg.src = e.target.result; 
}; 
function updatePic(files){
    var newPic;

    if (files && files.length>0) {
        newPic = files[0];
        
        if (
            newPic.type != "image/jpeg" &&
            newPic.type != "image/jpg"  &&
            newPic.type != "image/png"  &&
            newPic.type != "image/gif"
            ) {
            alert ('Only images, please');
            return;
        }
        console.log('read', newPic);
        reader.readAsDataURL(newPic);

    } else {
        console.log("no files :'(");
        return;
    }
}
