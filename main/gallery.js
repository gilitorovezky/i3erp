    // Load images files of the live project and display on the screen in grid
    var imageSelected=[];


    function gallery() {
        
        const arrIndex=Number(window.location.hash.split("?")[1]);
        const screen_name="Gallery";
        windowLog.trace("Inside "+screen_name);
        //prepareDisplay("#result-table1");
  
        out ="";        // used to html code
        const header=$('#mainHeader th:nth-child(1)').html(); // Identify the header
        //window.location.hash = '#gallery';
        $(".grid-gallery").show();
        $(".grid-gallery").css({'display' : "grid"});
        
        gallerySelector= $('#gallery');
        //const folder=$("#screen_name").html().toLowerCase();  // initialize folder
        const images_obj=JSON.parse(classArray[lastScreen].arr[arrIndex].images_json);
        if ( images_obj.NumOfFiles > 0 ) {
            document.getElementById("screen_name").innerHTML=screen_name;
            $("#editLabel,#mainDiv,#result-table1,#pSummaryID,#postScrollit").hide();
            //$("#rootID,#configID,#libraryID,#systemID").hide();
            //$(".main_menue").hide();
            //$("#centercellID").invisible();

            for (var i=0; i < images_obj.NumOfFiles;i++) {
                const imageID  = "image-"+i;
                const checkImageID = "checkImage-"+i;
                //var filename=images_obj.Uploaddir+images_obj.Files[i].file2upload;
                let fileName=appConfig.root_projects+classArray[lastScreen].arr[arrIndex].project_number+"/"+lastScreen.toLowerCase()+"/"+classArray[lastScreen].arr[arrIndex].foldername   +"/"+images_obj.Files['file2upload'+i];
                out += `<div><img src="${fileName}" name="${fileName}" class="imageGallery" id="${imageID}"/>
                        <input type="checkbox" name="imageCheckBox"  class="img_chkbox" id="${checkImageID}"/><div class="desc">Add a description of the image here</div></div>`; 
            }

            gallerySelector.html(out);  // print out the images

            // Select checkboxes by name and attach a click event handler
            $('input[name="imageCheckBox"]').click(function() {
                // Check if the checkbox is checked
                if ($(this).is(':checked')) {  // Checkbox is checked
                    windowLog.trace("Image checked");
                } else      // Checkbox is unchecked
                    windowLog.trace("Image unchecked");
            });

            $("#gallery").on('click','img', function (evt) {
                imageClickHandler(evt);});
            
            $("#gallery").on( "dblclick", 'img', function(evt) {
                var a = document.createElement('a');
                //a.href = href;
                    //  a.setAttribute('target', '_blank');
                    $(`<a href="${evt.currentTarget.src}" target="blank"></a>`)[0].click();   
                a.click();
            });

            $(".containerGallery").visible();
            $(".containerGallery").show();
        }
                
        return false;    
    }

    function selectAllPics() {

        if ($("#selectAllImages").is(':checked')) {
            $(".imageCls").css({"border": '4px solid #098207'}); // draw border around all images
            document.getElementById("moveImageFiles").disabled=false;
        }
        else {
            $(".imageCls").css({"border": '0px solid #098207'})  // clear border from all images
            document.getElementById("moveImageFiles").disabled=true;
            imageSelected=[];   // reset the array
        }
    }

    // handle the file move from one project to another
    function moveFiles(){

        var out="";
        document.getElementById("moveImageFiles").disabled=true;
        document.getElementById("CloseGlryBtn").disabled=true;
        charactersCount = 0;
        $(".main_menue").invisible();
        $("#centercellID").visible();   
        $("#innerCellID tbody tr:first").hide();    // hide the projects label
        $('#buttomHalf').css({'font-size'	:	'10px'});
        out =  `<div><center><input type="button" class='button' id="MoveBtn" value="Move" onclick="return move2Files(evt);">`;
        out += `<input type="reset" value="Reset" class='button' id="resetForm" onclick="return onResetMoveFiles(evt);">`;
        out += `<input type="button" value="Close" class='button' id="closeForm" onclick="return onCloseMoveFiles();">`;

        //$("#buttomHalf").on( "click", function() { buttomHalf(); });
        $("#buttomHalf").html(out);
        $("#MoveBtn").prop("disabled",true);
        $('#centerTXT').html('<td><label for="prjShortCutGallery" class = "prjLabel">Project Number</label><input class="prjShortCutInput" id="prjShortCutGallery" type="text" name="projectNumber" size="20" maxlength="50"></td>');
        $('#centerTXT').show();
        $("#prjShortCutGallery").focus();
        $("#gallery").unbind("click");    // disable any firther clicks
        $("#buttomHalf").unbind("click");    

        return false;
    }

    function closeGallery() {

        //$(".containerGallery").invisible();
        //$(".grid-gallery").css({'display' : "none"});
        $(".grid-gallery").hide();
        $(".containerGallery").hide();
        $("#pSummaryID").show();
        $("#result-table1").show();
        $("#caption").show();
        $("#gallery").unbind( "click" );
        $(".main_menue").visible();
        $("#centercellID").invisble(); 
        $("#innerCellID tbody tr:first").show();
        $("#innerCellID tbody tr:last").show();
        imageSelected = [];

        return false;
    }

    function move2Files(event) {

        alert("About to move");

        return false;
    }

    function onResetMoveFiles(evt) {

        evt.target.value="";

        return false;
    }

    function onCloseMoveFiles() {

        $("#centercellID").invisble();
        document.getElementById("moveImageFiles").disabled=false;
        document.getElementById("CloseGlryBtn").disabled=false;
        $("#gallery").on('click','img', function (evt) {
            imageClickHandler(evt);});

        imageSelected = [];
        $(".imageCls").css({"border": '0px solid #098207'});  // clear border from all images
        
        return false;
    }

    function imageClickHandler(event) {

        if ( imageSelected.indexOf(event.target.id) != -1) { // image already selected
            $("#"+event.target.id).removeClass("img-border");
//            $("#"+evt.target.id).css({"border": '0px solid #098207'}); // draw border around all images
            imageSelected.splice(imageSelected.indexOf(event.target.id),1); // remove the list
            //if ( imageSelected.length == 0 ) 
                //.getElementById("moveImageFiles").disabled=true;
        }
        else {
            $("#"+event.target.id).addClass("img-border");
            imageSelected.push(event.target.id);
            //document.getElementById("moveImageFiles").disabled=false;
        }
    }

    function galleryCB() {


    }