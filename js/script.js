


var myMigstagram;
$(function(){

    $('#image_upload').on('change', function(e){
        if (typeof e.target.files != "undefined") {
            myMigstagram.updatePic(e.target.files);
        }
    });

    myMigstagram = new Migstagram();

    //position the loading div on top of the canvas and hide it
    var canvas_position = ($('#editting_canvas').position());
    var canvas_width = ($('#editting_canvas').width());
    var canvas_height = ($('#editting_canvas').height());
    $('#loading').hide().css({
        'position': 'absolute'
        ,'top':     canvas_position.top+'px'
        ,'left':    canvas_position.left+'px'
        ,'width':   canvas_width+'px'
        ,'height':  canvas_height+'px'
    });

    /**
     * Click handler for the buttons
     */
    $('.controls button.effect').click(function(){
        var effect = $(this).attr('data-filter');
        var params = $(this).attr('data-filter-param');
        if ( typeof params != "undefined") {
            params = params.split(',');
        }else{
            params = false;
        }

        if (typeof myMigstagram.filters[effect] != "function" ) {
            console.log('Effect '+effect+ ' not available');
        }else{
            $('#loading').fadeIn(200, function(){
                myMigstagram.filters[effect](params, function(){
                    console.log('Effect '+effect+' finished');
                    $('#loading').fadeOut();
                });
            });
        }
    });
    $('.controls .reset').click(function(){
        myMigstagram.resetPicture();
        console.log('Reset image');
    });
});
