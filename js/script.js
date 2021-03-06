var myMigstagram;
$(function(){

    $('#image_upload').on('change', function(e){
        if (typeof e.target.files != "undefined") {
            $("#dropbox").hide();
            myMigstagram.updatePic(e.target.files);
        }
    });

 
    var noopHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    var dropHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var files = e.dataTransfer.files;
        var count = files.length;
        
        // Only call the handler if 1 or more files was dropped.
        if ( count > 0 ) {
            $("#dropbox").hide();
            myMigstagram.updatePic(files);
        }
    }
    //File Drag and Drop
    var dropbox = document.getElementById("dropbox")
    dropbox.addEventListener("dragenter",   noopHandler, false);
    dropbox.addEventListener("dragexit",    noopHandler, false);
    dropbox.addEventListener("dragover",    noopHandler, false);
    dropbox.addEventListener("drop",        dropHandler, false);

    myMigstagram = new Migstagram();
    for (var filter in MigstagramFilters) {
        console.log('adding '+filter+' filter');
        myMigstagram.addFilter(filter, MigstagramFilters[filter]);
    }

    //position the loading div on top of the canvas and hide it
    var canvas_position = ($('#editting_canvas').position());
    var canvas_width = ($('#editting_canvas').width());
    var canvas_height = ($('#editting_canvas').height());
    $('#loading').hide().css({
        'position': 'absolute'
        ,'top':     canvas_position.top+'px'
        ,'left':    canvas_position.left+'px'
        ,'width':   (canvas_width+2)+'px'
        ,'height':  (canvas_height+2)+'px'
    });
    var dropbox_padding = 10;
    $('#dropbox').css({
        'position': 'absolute'
        ,'top':     (canvas_position.top + dropbox_padding)+'px'
        ,'left':    (canvas_position.left + dropbox_padding)+'px'
        ,'width':   (canvas_width - dropbox_padding*2)+'px'
        ,'height':  (canvas_height - dropbox_padding*2)+'px'
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

        $('#loading').fadeIn(200, function(){
            myMigstagram.callFilter(effect, params, function(){
                console.log('Effect '+effect+' finished');
                $('#loading').fadeOut();
                $('.controls .undo').removeAttr('disabled').html('Undo '+effect);
            });
        });
    });
    //Actions of the operations buttons
    $('.controls .reset').click(function(){
        myMigstagram.resetPicture();
        $('.controls .undo').attr('disabled', 'true').html('Undo');
    });
    $('.controls .undo').click(function(){
        myMigstagram.undo();
        $('.controls .undo').attr('disabled', 'true').html('Undo');
    }).attr('disabled', 'true');
    $('#save').click(function(){
        myMigstagram.save();
    });

    //Can only be used if served from a server, since we need a proxy to circumvent the tainted canvas with
    //cross-domain information
    if (document.location.origin == 'file://') {
        $('#load_url').hide();
    } else {
        $('#load_url').click(function(){
            myMigstagram.loadUrl(prompt('Paste your URL here:'), function(error){
                if (!error) {
                    $("#dropbox").hide();
                }
            });
        });
    }


    //Accordion
    $('.accordion>.accordion-content').hide();
    $('.accordion>h3').click(function(){
        if ( $(this).hasClass('active') == false ) {
            $('.accordion>h3').removeClass('active');
            $(this).addClass('active');
            $('.accordion>.accordion-content').slideUp();
            $(this).parent('.accordion').first().find('.accordion-content').slideDown();
        }
    });
});
