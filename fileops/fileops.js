var files2upload=[];	// global array to store the upload files setting 

function fileOps(data) {

    var retCode=true;
    let dstnFolder;

    windowLog.trace("fileOpd:operation-"+$('input[name=opRadio]:checked').val());
    if ( $('input[name=opRadio]:checked').val() == "delete")    // in case of delte just move the file to the archive
        dstnFolder=appConfig.archive_dir;
    else
        dstnFolder=appConfig.root_projects+data.dstnFolder;

    var json={'dstnFolder':   dstnFolder,    // adding the rot uplad folder (taken from the global app setting )
              'srcFolder' :   appConfig.root_projects+data.srcFolder, 
              'filename'  :   msg.data.filename,
              'op'        :   $('input[name=opRadio]:checked').val()};	// set the paramteres to sent to the server
    $.ajax({url         : "../fileops/fileOps.php",
            method		: "POST",
            data        : JSON.stringify(json),
            dataType	: "json",
            async       : false,
            success		: function(result) {
                var ref = $('#jstree').jstree(true);
                if ( result.Status ) {     // true means the operation was a success
                    retCode=refreshTree(msg.destTree,$('input[name=opRadio]:checked').val(),"f_"+result.fileName);
                    windowLog.trace("fileOps:"+$('input[name=opRadio]:checked').val()+" obj-"+result.fileName+" result:"+retCode);
                }
                else
                    retCode=false;
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.trace("Failed to $('input[name=opRadio]:checked').val()"+textStatus + ", " + error); 
            })   
    });

    return retCode;
}

function onSubmitUploadFiles() {

    windowLog.trace("onSubmitUploadFiles");

    submitFiles();

    $("#submitFilesID,#resetFormID").hide();
   
    $("#fileNames").html("");    
    $("#returnMsg").html("&nbsp");	    // reset the message
    return false;
}

function onResetUploadFiles(event) {

    windowLog.trace("onResetUploadFiles");
    
    $("#submitFilesID,#resetFormID").hide();
    $("#fileNames").html("");
    $("#returnMsg").html("&nbsp");	    // reset the message
    files2upload=[];
}

function onChangeUploadFilesForm(event,msg) {

    windowLog.trace("Inside onChangeuploadFilesForm");
    files2upload=[];
    $("#returnMsg").html("&nbsp");   // reset the return msg just in case
    files2upload.push(msg); // save the projectname of the current record
    for (var j=0;j < event.files.length;j++) // save the current file(s)
        files2upload.push(event.files[j]);

    $("#submitFilesID,#resetFormID").css({"background-color"    :   '#faba0a', 
                                          'cursor'              :   'pointer'});
    $("#submitFilesID,#resetFormID").show();
    $("#submitFilesID,#resetFormID").prop("disabled",false);
    if (event.files.length == 1)
        $("#fileNames").html("File to upload: "+event.files[0].name);
    else
        $("#fileNames").html("Multiple files");
    return false;
}

function showFileUpload(eventTarget,callType,parentElement,parentFolder) {

    windowLog.trace("inside showFileUpload");
    //const aboutDialog=document.getElementById(parentElement); 

    $("#"+eventTarget.closest('table').id +",#editLabel,#navID,#main-menue").addClass("greyed-out");
    var out="";
    out =  `<center><a style="font-weight: bold;font-style: italic; font-size=15px">Upload Files</a></center><br>`;
    out += `<form class="upldForm" method="POST" enctype="multipart/form-data">`;
    if ( callType == "deviceUpload" ) { 
        out += `<input id="inputfileID" type="file" name="fileToUpload[]" multiple/>`;
        out += `<label for="inputfileID" class="custom-file-upload">Device Upload</label>`;
    }
    out += `<div style="display: inline-block"></div><input  tabindex="0" id="inputCloudfileID" type="file" name="fileToUpload[]" multiple/>`;
    out += `<div style="display: inline-block"><label for="inputCloudfileID" class="custom-file-upload honeydow">Library Upload</label></div>`;
    out += `<div style="display: inline-block"><p  tabindex="0" id="fileNames" class="label1">Filenames here</p></div>`;
    out += `<center><p id="returnMsg" style="margin:0">&nbsp</p></center><br>`;
    if ( $("#aboutDialog").attr('name') != 'jstree2' )   // special case if the event called within the jstree
        out += `<div style="display: flex;justify-content:space-around"><center><input tabindex="0" type="button" class='button' id="closeFileUpload" value="Close"></center>`;
    else {
        windowLog.trace("ShowUploadfiles- not showing close");
        out += `<div style="display: flex;justify-content:space-around">`;
    }
    out += `<input tabindex="0" type="reset" value="Reset" class='button' id="resetFormID">`;
    if ( callType == "userJobUpload" )
        out += `<input tabindex="0" type="button" class='button' value="Submit and Sign Out" id="submitFilesID"></center></div></form>`;
    else
        out += `<input tabindex="0" type="button" class='button' value="Submit" id="submitFilesID"></div></form>`;
    
    //$("#submitFilesID,#resetFormID").prop("disabled",true).css({'background-color'    :   '#c3bdbd'});

    //aboutDialog.innerHTML=out;
    
    //    $("#"+parentElement).show();
    $("#"+parentElement).html(out);    // show the dialuge
    //const dlg=document.getElementById(parentElement);
    //dlg.showModal();
    //$(".editCntrlClass").visible();
    $("#submitFilesID,#resetFormID").hide();
    $("#"+parentElement).show();

    let paneName="";
    if ( parentElement === "buttomHalfID" ) {  // only from Library upload files
        $("#buttomHalfID").visible();
        paneName=$("#aboutDialog").attr('name') ;
    }
    /*else {
        $(".aboutDlg").css({'height' : "fit-content",
                            'width'  : "fit-content"});
        
    }*/
    //$("#submitFilesID,#resetFormID").prop("disabled",false);
    //$("#submitFilesID,#resetFormID").css({'background-color'    :   '#c3bdbd'});
    var prjNumber=0;
    //calltype 4: from Tree parentFolder is the filepath 
    if ( callType === "generalUpload" )
        prjNumber=$(eventTarget).closest('tr').find('[id^="prjctNumberID"]').val();
    else 
        if ( ( callType === "configurationUpload" ) && ( lastScreen.toLowerCase() == "employees" ) ) 
            parentFolder += "/"+$(eventTarget).closest('tr').find('[name="fullname"]').val();// add the employee name
        //recNumber=Number($(event.target).closest('tr').find('[id^='+headers[$("#screen_name").html()]['primaryKey']+']').val());
    // parentFolder 3 (from tree is "", from others the ),5,6 is lastScreen    
    // parentFolder : userJobUpload,gasUpload,3 (tree) is "" 
    // parentFodler 4: 
    $("#"+parentElement).unbind('change');
    $('#'+parentElement).on('change',{paneName        :   paneName,
                                      parentElement   :   parentElement,
                                      prjNUmber       :   prjNumber,
                                      eventTarget     :   eventTarget,
                                      parentFolder    :   parentFolder,   
                                      callType        :   callType},function(event) {
        if ( event.target.id != "prjTreeID" ) 
            onChangeUploadFilesForm($("#"+event.target.id)[0],event.data);    // pass the file element and the project number to name the file
    })
}

function fileOpsGo(msg) {

    let retCode=true;
    windowLog.trace("Clicked yes");
    //$('#centerTXT').html("");
    //currCell.value; // destintion folder

    let msgColor,resultMSG;
    if ( fileOps(msg) ) {   // move, delete, or copy the file
        msgColor ='green';
        resultMSG = "File "+$('input[name=opRadio]:checked').val()+" succesfully";
    } else {
        msgColor ='red';
        resultMSG = "Operation failed";
        retCode = false;
    }
    $("#opsReturnID").css({'font-size'  :   '13px',
                            'color'     :    msgColor});
    $("#opsReturnID").html('<center>'+resultMSG+'</center>');
    //cleanupTree();
    $("#yesBtn").hide();
    $("#opsReturnID").show();
    $("#cancelFileID").val("Close");

    return retCode;
}

function uploadFilesMngr(isFiles,isPrjSet,ID) {  // 1st parameter is a flag that indicate are there any files loaded and 2nd is if the proect_number is set
    // in certain screens if the prjct number is empty than disable uploading file element

    var fileupload="";

    if ( !isFiles )
        //fileupload= `<button tabindex="0" id="allFilesID" type="button" class="button2">Upload file(s)</button>`; //disable the upload if project is unset
        fileupload = `Upload file(s)`; 

    else    
        fileupload='<select tabindex="0" id="selectFiles" class="filesSelect button-view"><option value="uploadFiles">Upload Files</option><option value="showFiles">Show Files</option></select>';

    return fileupload;
}

function closeFileUploadScreen() {

    $("#fileUploadControl").hide();
    $("#fileUploadControl").html("");
    $("#main-menue").removeClass("greyed-out");
    
}


function submitFiles() {

    let target_dir="";
    windowLog.trace("Inside submitFiles,type:"+files2upload[0].callType);
    var filesCount=files2upload.length-1   // decreaase 1 since the first row is task properties
    var formData = new FormData();
    var callType="";
    //var fileToUpload=[];
    //var formData2 = new FormData();
    var recIndex=0; 
    var entryNumber=0;
    var retValue=false;
    
    if ( filesCount > 0 ) {    
        
        switch ( files2upload[0].callType ) {

            case "userUpload"   	:	// user upload
                windowLog.trace("User upload files");
                formData.append('calltype',"userUpload");
                formData.append('index_id',"00");    // stub
                callType="generalUpload";
                target_dir=appConfig.receipts_dir;	// set the root upload dir
                formData.append('target_dir',target_dir);
            break;

            case "gasUpload"	    : 	
                formData.append('calltype',"gasUpload");
                callType="gasUpload";
                target_dir=appConfig.gas_dir;	// set the root upload dir
                formData.append('target_dir',target_dir);
                formData.append('index_id',"00");    // stub
            break;

            case "userJobUpload"	: 	
                formData.append('calltype',"userJobUpload");
                target_dir=appConfig.root_projects;
                formData.append('target_dir',target_dir);   // the project_name is add at insert_job2 after reading the project_name
                formData.append('index_id',"00");   // stub
                formData.append('task_id', currentWorkingTask.task_id); // Add task id only when it is upload files from signout 
            break;
                       
            case "generalUpload"    :   // upload files from projects and other screens, not from customers
                const parentFolder=files2upload[0].parentFolder;// which is the lastScreen
                formData.append('calltype',"generalUpload2");
                formData.append('module',headers[parentFolder]['tableName']);
                formData.append('index',headers[parentFolder]['primaryKey']);
                //module=parentFolder;
                recIndex=Number($(files2upload[0].eventTarget).closest('tr').find('[id^='+headers[parentFolder]['primaryKey']+']').val());
                formData.append('index_id',recIndex);

                //var contactAllFields="";    //  // construct the flder name based on the record fields
                $(files2upload[0].eventTarget).closest('tr').find('td:gt(1)').each(function(iCol,iTD) {   //$(this).find('td:gt(1)').each(function(iCol,iTD) {   
                    var value="";
                    if ( iTD.childElementCount > 0 ) {
                        switch ( iTD.childNodes[0].nodeName ) {
                            case "INPUT" :
                            case "TEXTAREA" :
                                if (iTD.childNodes[0].value == "IsActive")       
                                    value = iTD.childNodes[0].checked==false?"0":"1";
                                else 
                                    value = iTD.childNodes[0].value;
                            break;
            
                            default:
                                value=iTD.childNodes[0].innerText;
                        }   
                    }
                    else
                        value=iTD.innerText;
                });
                entryNumber=classArray[parentFolder].retEntrybyID(recIndex);
                target_dir=appConfig.root_projects+files2upload[0].prjNUmber+"/"+parentFolder.toLowerCase()+"/"+classArray[parentFolder].arr[entryNumber].foldername;
                formData.append('target_dir',target_dir);
                formData.append('subFolderName',recIndex);
                formData.append('isFileExist',Number(classArray[parentFolder].arr[entryNumber].file_uploaded));
            break;

            case "deviceUpload"                  :   // upload from the library
                formData.append('calltype',"generalUpload3");
                formData.append('module',"docket");
                formData.append('index_id',-1);
                formData.append('target_dir',appConfig.docket_dir+files2upload[0].parentFolderr.toLowerCase()+"/");
            break;

            case 5                  :
                formData.append('calltype',"generalUpload3");
                formData.append('module',files2upload[0].parentFolder);
                formData.append('index_id',-1);
                formData.append('target_dir',appConfig.config_dir+files2upload[0].parentFolder.toLowerCase()+"/");
            break;

            case "uploadCstmrFile" :   // customers
                
                // files2upload[0].parentFolder here is "customers".. decided to generlize the folder instead of hard coded for future use
                if ( $(files2upload[0].eventTarget).parents('table').nth-child($(files2upload[0].eventTarget).parents('table').length-1)[0].id == "result-table1") 
                    recIndex=Number($(files2upload[0].eventTarget).closest('tr').find('[id="customer_id"]').val());
                else
                    recIndex=Number($("#customerTblID").find('td[id="customer_id"]').text()); // get the customer_id value

                entryNumber=classArray[lastScreen].retEntrybyID(recIndex);
                if ( entryNumber != -1) {
                    target_dir=appConfig.customers_dir+(recIndex+"-"+classArray[lastScreen].arr[entryNumber].customer_first_name+"-"+classArray[lastScreen].arr[entryNumber].customer_last_name);
                    formData.append('calltype',"generalUpload4");
                    formData.append('index',headers["Customers"]['primaryKey']);
                    formData.append('module',files2upload[0].parentFolder.toLowerCase());
                    formData.append('index_id',recIndex);
                    formData.append('target_dir',target_dir);
                }
            break;
        }
        formData.append('employee_id',eID); 		// Add employee_id flag
        //formData.append('tempJson',classArray[lastScreen].arr[entryNumber].images_json);
        
        for (var i = 0; i < filesCount; i++) {  // startong from 1 since entry 0 is reserved
            if ((files2upload[1+i].size > 0) && (files2upload[1+i].size < appConfig.maxUploadFileSize)) {
                windowLog.trace("Append filename:"+files2upload[1+i].name+" Filesize:"+files2upload[1+i].size);
                formData.append('fileToUpload[]',files2upload[1+i]); // append the file to the list of uploaded file(s)
                //fileToUpload.push(files2upload[i]);
            }
            else { //file size is either empty or too big to load
                document.getElementById("returnMsg").innerHTML = "File too big to upload";
                document.getElementById("returnMsg").style.color = "red";
                windowLog.trace("file "+files2upload[1+i].size+" too big to upload");
                filesCount--;	// decrease the number of files to send
            }
        }
        //let arrObj={'calltype':callType,'employee_id':eID,'target_dir':target_dir,"fileToUpload":fileToUpload};	// set the parqmteres to sent to the server
        for (const pair of formData.entries())
            windowLog.trace("key:"+pair[0]+" val:"+pair[1]);
       
        fetch("../main/insert_job2.php", {method    : "POST",
                                          body      : formData})
            .then(response 	=> response.json())
            .then((data) 	=> { checkUploadStatus(data);
                                 if ( data[0].Status > 0) {  // file(s) uploaded succesfully
                                    retValue=true;
                                    switch ( files2upload[0].callType ) { 
                                        case "uploadCstmrFile"  :
                                        case "generalUpload"    :   // the next section is only relevant when uploading from the main 8 screens
                                            var fileTD=files2upload[0].eventTarget.parentNode;  // td of files element 
                                                //if ( $(files2upload[0].eventTarget).parents('table').nth-child($(files2upload[0].eventTarget).parents('table').length-1)[0].id == "result-table1" ) {
                                                //const thIndex=$('#result-table1 th:contains("Files")').index();
                                                //fileTD=$(files2upload[0].eventTarget).closest('tr').find('td:nth-child('+thIndex+')')[0]; // only for customers override the fileID with the customers tow
                                            if ( Number(classArray[lastScreen].arr[entryNumber].file_uploaded) == 0 ) 
                                                fileTD.innerHTML=uploadFilesMngr(1,true);  
                                            if ( classArray[lastScreen].arr[entryNumber].file_uploaded != data.NumOfFiles ) {
                                                classArray[lastScreen].arr[entryNumber].file_uploaded=data.NumOfFiles;
                                                classArray[lastScreen].arr[entryNumber].images_json = JSON.stringify(data.Files);
                                            }
                                       
                                            break;
                                        
                                        case 4:
                                            refreshTree("create","jstree2",data[0].fname);  // uplod file only done from the library pane(jstree2) 
                                            /*
                                            var ref = $('#'+files2upload[0].paneName).jstree(true),
                                            sel = ref.get_selected();
                                            var newNodeID=ref.create_node(sel,data[0].fname,"last");
                                            newID=Number($("#"+newNodeID)[0].previousSibling.id.split("_")[1])+1; // increase the last id 
                                            $("#"+newNodeID)[0].id="f_"+newID+"_"+data[0].fname;    // put together the new ID
                                            */
                                            break;

                                        case "userJobUpload"    :
                                             $('#upperRightQuadrant').hide();   // hide the upper right

                                            break;
                                    }   
                                }
                            })
            .catch(error    => { console.error('Error:', error); });

       //document.getElementById("submitFilesID").disabled=true;                                 
    } else	
        document.getElementById("submitFilesID").hidden=true; // Hide the submit button

    //$("#inputfileID").val("");  // reset the fileselection
    //$("#submitFilesID,#resetFormID").prop("disabled",true);
    //$("#submitFilesID,#resetFormID").css({'background-color':'#c3bdbd',
    //                                      'cursor'          :'not-allowed'});
    //files2upload=[];	   
    return retValue;
}