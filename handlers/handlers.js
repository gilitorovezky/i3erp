/*
const optionsHandler = {
    option1: (option) => console.log(`Selected option '${option}'.`),
    option2: (option) => console.log(`Great!!! You have selected the '${option}' option.`),
    option3: (option) => console.log(`Mmmmm, it's interesting you have choosen the '${option}' option.`),
    option4: (option) => console.log(`If it's right for you, the '${option}' option is fine for me too.`),
    }
*/
    /*let option = 'option1';
    optionsHandler[option](option); // Selected option 'option1'.

    option = 'option2';
    optionsHandler[option](option); // Great!!! You have selected the 'option2' option.

    option = 'option3';
    optionsHandler[option](option); // Mmmmm, it's interesting you have choosen the 'option3' option.

    option = 'option4';
    optionsHandler[option](option); // If it's right for you, the 'option4' option is fine for me too.
*/

/* 
// https://jsonplaceholder.typicode.com - Provides test JSON data
var urls = [
  'https://jsonplaceholder.typicode.com/todos/1',
  'https://jsonplaceholder.typicode.com/todos/2',
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/posts/2'
];

// Maps each URL into a fetch() Promise
var requests = urls.map(function(url){
  return fetch(url)
  .then(function(response) {
    // throw "uh oh!";  - test a failure
    return response.json();
  })  
});

// Resolve all the promises
Promise.all(requests)
.then((results) => {
  console.log(JSON.stringify(results, null, 2));
}).catch(function(err) {
  console.log("returns just the 1st failure ...");
  console.log(err);
})
*/
    var lastFocusedEntry=[]; // holds the last focused entry in the record
    var lastSelctedListItem=""; // holds the last selected item in the overlay list
    var customerRow;    // retain the row in the customer screen that clicked by the user to open Customer details.. used to udpate the fields
    window.onhashchange = function(e) {

        $('#editCBID').prop('checked', false); // Unchecks edit in case it was checked so the user will have to acknoledge in the next screen too.
        $("#mainDiv").removeClass('tab_border');
        $('#screen_nameTD,#leadsTab_nameTD').removeClass('tab_td active');
        //$("#captionTbl").css({'border' : 'none'});

        var oldURL = e.oldURL.split('#')[1];
        var newURL = e.newURL.split('#')[1];
        $("#preWeekID").hide();
        $('#screen_name').unbind("click");
        $("#leadsTab_name").html("");


        windowLog.trace("OnHash Change,oldURL:"+oldURL+" newURL:"+newURL);
        $("#main-menue,#navID,#tHalf,#projects,#customers").removeClass("greyed-out");
        $('img[id^="Pls"]').removeClass("greyed-out");
        if ( ($("#pSummaryID").css('display') != 'none') != true) { // do not go back or frwrd if project summary is open
         //$("#pSummaryID").is(":visible")
            if (newURL != "empljbs") {
                clearTimeout(intervalEJID);
                $("#ejTotalCostID").remove();
                $("#exportDialogueID").remove();
            }
            // retrieve the corresponding entry
            var result=Object.values(headers).filter(function(i) { 
                return newURL.includes(i.hash); //i.hash.includes(newURL)
            });
           
        // if (headers[lastScreen].hash != newURL) // check if the user already in the requested screen, then do noithing
            if (oldURL != newURL) // check if the user already in the requested screen, then do noithing
                result[0].callBack(result[0].params);	// Call the callback
        }
        else
            e.newURL.split('#')[1] = oldURL; // dont change the url

        return false;
    }


    $('body').on('keydown', function(event) {

        windowLog.trace("Inside body keydown ID:"+event.target.id+" key:"+event.key);
        const isCtrlShift = (event.ctrlKey || event.metaKey) && event.shiftKey;
        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
        const key=event.key;
        //if ( lastScreen != "Home" ) {
        for (const shortcut of shortcuts) {
            if (checkShortcut(event, shortcut)) {
                event.preventDefault();
                shortcut.action();
                windowLog.trace(`Shortcut triggered: ${shortcut.key}`);
                return;
            }
        }
        // Check if the 'S' key is pressed. Use event.code for modern browsers.
        /*if (isCtrlShift && event.code === 'KeyV') {
            event.preventDefault(); // Prevent the browser's default action (e.g., save page, screenshot)
            
            console.log('Ctrl + Shift + S pressed! Custom action here.');
            alert('Custom Save Action Executed!');
            
            // Place your custom logic here (e.g., save data via AJAX)
        }*/
    });


    $('#overLay').on("click",function(event) {

        windowLog.trace("Inside overLay Click");
        
        if ( event.target.innerText === "New Entry" ) {
            currCell.children().first().val("");    // reset the cell value
            //currCell.closest('table').hide();
            //newEntry(currCell,$("#mainHeader tr th:eq("+currCell.index()+")").text());
            //newEntry(currCell,$("#"+currCell.closest("table").find('[id="mainHeader"]').attr('id')+" tr th:eq("+currCell.index()+")").text());
            if ( $("#overLay ul").attr("data-module") !== "" ) {
                //newEntry(currCell,$("#overLay ul").attr("data-module"));
                newEntry(currCell,currCell.closest("table").find('[id="mainHeader"]').find(" tr th:eq("+currCell.index()+")").text());
                $("#overLay ul").attr("data-module","");
            }
            else
                newEntry(currCell,currCell.closest("table").find('[id="mainHeader"]').find(" tr th:eq("+currCell.index()+")").text());
        }
        else {
            currentRecordPointer=$("#uListID li").index(document.getElementById(event.target.id)); // get the current record
            windowLog.trace("current id: "+currentRecordPointer+" New ID:"+currentRecordPointer);
            //var new_event_id=event.target.id.split('-')[0]+'-'+newIx; // update the id to the new record id (take the first part after split)
            const new_event_id=$("#uListID li")[currentRecordPointer];
            windowLog.trace("New event id: "+new_event_id.id);
            //currCell.children().first().val(new_event_id.innerText);
            currCell.find("input").first().val(new_event_id.innerText);
        }
        //$('#overLay ul li')[0].focus();
        //event.currentTarget.id
        //if ( currCell.id != "prjShortCut" ) // is this the first time then ssign currCell to the input, otherwise skip
        //    currCell=currCell.find('input')[0];
        //currCell=currCell.children().first();
    });

    $( "body" ).delegate('#selectFiles',"mousedown", function(e) {

        windowLog.trace("Mousedown #selectFiles select option:"+e.target.value);
        //e.preventDefault();
    });

    $( "body" ).delegate('#selectFiles',"mouseup", function(e) {

        windowLog.trace("Mouseup #selectFiles select option:"+e.target.value);
        //e.preventDefault();
    });

    
    $( "body" ).delegate('#emplColorInputID',"change", function(e) {  // set the employee color" 
            windowLog.trace("emplColorInputID on change"+e.target.value);
            const selectedValue = $(this).val();            // Get the selected value
            classArray["Employees"].colors[$(this).siblings().first().val()]=selectedValue// update the new color in the class array;
            windowLog.trace("Selected employee:"+$(this).siblings().first().val()+",New color value: " + $(this).val());
            saveRow("Employees",e.target);
    });

    $( "body" ).delegate('#activeEmplListID',"change", function(e) {

        let assignmentOverride=0;

        windowLog.trace("activeEmplListID on change:"+$(this).val());
        if ( $(this).val() == "unassigned" ) {
           
            if ( e.target.closest('tr').id == "unAssignElementsTR" ) {
                assignmentOverride=0;
                $("#"+(this.closest("div").parentElement.id)).next().find('[id="assignID"]').hide();  
                $(this).closest("td").css("background-color","#ffffff"); // set the background color
                //$("#tx"+($(this).closest("div").parent().attr("id"))).css("background-color","#ffffff"); // set the background color
            }
            else {
                if ( e.target.closest('table').id != "addSingleRec" ) {

                    $("#tx"+this.closest("div").parentElement.id).find('[id="assignID"]').show();
                    $("#assignID").unbind("click");
                    const taskID = $(this).parents('div').filter(function() {
                                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
                            }).first().find('[name="taskID"]').val();
                    $('[id^="assignID"]').bind("click",{name                : $(this).val(),
                                                        taskDate            : $($(this).closest("div").find('[id="unAssgnTskDateID"]')).val(),
                                                        elementID           : $(this).closest("div"), // [0]
                                                        assignmentOverride  : 1, // since assign was selecged then set the is assgined to 1
                                                        taskID              : taskID},assignTaskHandler);
                }
                else 
                    $("#SaveNewBtn,#SaveCloseBtn").show();
            }
        }
        else {
        
            //if ($(e.target).parents('table').nth-child($(e.target).parents('table').length-1)[0].id != "addSingleRec") { // if not in the addSingleRec screen
            if ( this.closest('tr').id === "unAssignElementsTR" ) {
                $(this).closest("td").css("background-color",classArray["Employees"].colors[$(this).val()]); // set the background color
               
                if ( $(this).closest("td").find('[id="unAssgnTskDateID"]').val() != "" &&
                     $(this).closest("td").find('[name="projectNumber"]').val() != "" ) {
                   
                    $("#"+(this.closest("div").parentElement.id)).next().find('[id="assignID"]').show();
                       assignmentOverride=1;
                            //$("#tx"+this.closest("div").parentElement.id).find('[id="assignID"]').show();
                    $("#assignID").unbind("click");
                    const taskID = $(this).parents('div').filter(function() {
                                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
                            }).first().find('[name="taskID"]').val();
                    $('[id^="assignID"]').bind("click",{name                : $(this).val(),
                                                        taskDate            : $($(this).closest("div").find('[id="unAssgnTskDateID"]')).val(),
                                                        elementID           : $(this).closest("div"), // [0]
                                                        assignmentOverride  : 1, // since assign was selecged then set the is assgined to 1
                                                        taskID              : taskID},assignTaskHandler);
                }
                else {
                    
                    $("#"+(this.closest("div").parentElement.id)).next().find('[id="assignID"]').hide();  
                    
                    //$("#SaveNewBtn,#SaveCloseBtn").hide();
                    //newTaskDate = $($(this).closest("div").find('[id="unAssgnTskDateID"]'))[0].defaultValue;
                }
                
                //if ( $(e.target).closest('td')[0].id == "unAssigned" )
                //    windowLog.trace("Unassigned task detected");
                
            } else {
                if ( validateEnableSaveConditions(lastScreen,$(e.target.closest('tr'))) )
                    $("#SaveNewBtn,#SaveCloseBtn").show();
                else
                    $("#SaveNewBtn,#SaveCloseBtn").hide();
            }
        }

        if ( e.target.closest('table').id != "addSingleRec" ) { // dont auto save when at the new Task mode
        
            const taskID = $(this).parents('div').filter(function() {
                    return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));// decrease 1 since the elements start in 0
                }).first().find('[name="taskID"]').val();
            const tEntry=Tasks.arrTasks.findIndex(t => t.task_id == taskID);
            Tasks.arrTasks[tEntry].employee_name=$(this).val(); // update the task with the new name
            Tasks.arrTasks[tEntry].employee_id= classArray['Employees'].pNames[$(this).val()];  // update the task with the new eID
            
            const retResult=saveScheduler(e.target,0,false);
        }
    });

    $( "body" ).delegate('#selectFiles',"change", function(e) {
        windowLog.trace("selectfiles change, option:"+e.target.value+" hash:"+window.location.hash.substring(1,window.location.hash.length));
        switch (e.target.value) {

            case "uploadFiles" :
                const callType= headers[lastScreen]["callType"];
                switch ( $(e.target).parents('table').nth-child($(e.target).parents('table').length-1)[0].id) {

                    case "result-table1"    : // main window
                      
                        break;

                    case "customers"   : 
                    
                        $("#cstmrUploadFileID").removeClass("button").prop("disabled",true);
                        customerPanes.map(function(pane) {  // loop
                            $("#new"+pane+"Btn").removeClass("button").prop("disabled",true); // disable all new lead/estimate/project button
                        });
                        $(".editCntrlClass").css("padding","0px");
                        $("#selectFiles").prop("disabled",true);    // disable click while upload files dlg is open 

                        break;
                }
                showFileUpload(e.target,callType,"fileUploadControl",lastScreen);
                break;

            case "showFiles"     :
                break;
        }
    });  

    $("body").delegate('#main-menue,#innerCellID,#navID',"keydown", function(event) {
        
        let returnCode=true;

        windowLog.trace("Inside main-menue innerCellID keydown ID:"+event.target.id+" key:"+event.key);

        if ( event.key === "Enter" &&
             lastFocusedEntry.length === 0 ) {
            returnCode = false;

            dispatcher(event);

        }
        return returnCode;
    });

    $("body").delegate('#editControl',"keydown", function(event) {
        
        windowLog.trace("Inside editControl button delegate keydown:"+event.key);
        switch (event.key) {

            case "y"        :
            case "Y"        :
                 $("#editCBID").prop( "checked", true );
            case "escape"   :
            case "n"        :
            case "N"        :    
                $("#editControl").html("");
                $("#editControl").hide();

                if ( lastScreen !== "Customers" )
                    setCellFocus(); // return the focus back to the original field
            break;
        }
        //$("#result-table1").removeClass("greyed-out");
    });

    function captionDispatcher(event) {

        windowLog.trace("Inside captionDispatcher:"+event.target.id);

        switch (event.target.id) {

            case "editCBID"         :
            case "editSliderID"     :
                if ( $('#editCBID').is(":checked") ) {
                     $("#editCBID").prop("checked", false);
                    if ( lastScreen === "Scheduler" ) // if in Scheduler screen then disable the edit mode
                        $("[id=editTaskID").addClass("greyed-out").prop("disabled",true);
                }
                else {  
                    $("#editCBID").prop("checked", true);
                    if ( lastScreen === "Scheduler" ) // if in Scheduler screen then disable the edit mode
                        $("[id=editTaskID").removeClass("greyed-out").prop("disabled",false);
                }

                windowLog.trace("EditCBID changed:"+$('#editCBID').is(":checked"));
            break;

            case "newTaskSC"        :   // called from Scheduler only to crete a new tsk
                $("#caption,#result-table").addClass("greyed-out");  // grey-out the scheduler to prevent from user clicks
                $("[id=editTaskID").removeClass("greyed-out").prop("disabled",false);   // enable all Edit task button since this actin turn on the global Edit flag downstream
                $("#main-menue,#navID,#tHalf,#innerCellID,#Pl,#caption,#result-table").addClass("greyed-out");
                addNewRec("Scheduler",event.target,"addSingleRec");
            break;

            case "previousWeekID"   :
                updateWeek(-7);
            break;
            
            case "nextWeekID"       :
                updateWeek(+7);
            break;

            case "isTCID"           :
                const arrChkBox = document.getElementsByName("labor_cost");
                $(arrChkBox).toggle();
            break;
        }
    }

    $("body").delegate('#captionRow',"keydown", function(event) {

        windowLog.trace("Inside captionRow keydown handler:"+event.target.id+" key:"+event.key); 

        let returnCode=true;

        if ( event.key === "Enter" ) {
            returnCode = false;

            captionDispatcher(event);
        }
        return returnCode;

    });

    $("body").delegate('#captionRow',"click", function(event) {

        windowLog.trace("Inside captionRow click handler:"+event.target.id); 
        captionDispatcher(event)
        return false;
    });

    $("body").delegate("#overLay","keydown",{invoker    : "main"}, function(event) {

        windowLog.trace("overLay keyDown handler(key):"+event.key);
        overLayKeyDown(event);
        return false;
    });

    $( "body" ).delegate("#editCBID","change",function() {
        windowLog.trace("editCBID changed setting:"+$('#editCBID').is(":checked"));
        //if ( lastScreen == "Customers" )
        //    customerPanes.map(x => $("#new"+x+"Btn").toggle());
    });


    /*$("#navID").on('click',function(event)    {

        windowLog.trace("Inside navID click:"+event.target.id);
        dispatcher(event);
        
        return false;
    });*/

    $("#aboutDialog,#fileUploadControl").on('click',function(event)    {

        windowLog.trace("Inside about/file Dialog click:"+event.target.id);

        //currCell=$(event.target).closest('td'); // Identify the TD
        //setCellFocus();
        switch (event.target.id) {

            case "closeCstmnrDlg"   :
               
                if ( window.location.hash != "#customers") {    // case when user clcked n new customer from the main circle
                    $("#editDiv").hide();
                    $(".scrollit").hide();
                    $("#centercellID").visible();
                    $("#main-menue,#centercellID,#parentDiv").show();
                }
                else {  // update the corresponding row in customers view
                    windowLog.trace("Update custoemrs view");
                    //updateCustomerView(customerRow);
                }
                charactersCount=0;
                $("#navID,#main-menue,#projects,#result-table1").removeClass("greyed-out"); 
                $("#overLay ul").empty(); //$('#overLay ul li').html("");
                document.getElementById("aboutDialog").close();
                $("#aboutDialog").html("");
                $("#aboutDialog").removeClass("customersDlg");  
                $("#cstmrShortCut").val('');
                //}
            break;

            /*case "updateRecordBtn"  :
                updaterCustomerPanes(Number($("#customerNumber").val()));
                break;*/

            case "saveCstmrDlg"     :
            break;

            case "resetFormID"      :
                onResetUploadFiles(event);
            break;
            /*case "closeFileUpload"  :
                onCloseUpload();
            break;*/

            case "inputfileID"      :
            case "cpRadioID"        :
            case "mvRadioID"        :
            case "upldFileRadioID"  :
            case "dlRadioID"        :
            case "inputCloudfileID" :
            //case "noBtn"            :
            //case "yesBtn"           :
               /* var ref = $('#jstree').jstree(true),
                    sel = ref.get_selected();
                    ret = ref.delete_node(sel);
                var msg={dstnFolder     : appConfig.archive_dir,
                         srcFolder      : e.data.srcPath,
                         filename       : selectedNode,
                         parentFolder   : e.data.parentFolder};
                fileOpsGo(msg);*/
                
            break;

            case "cancelFileID"          :
                cleanupTree();
            break;

            case "closeTreeDlg"          :
                if ( $('#aboutDialog').attr('name').includes("jstree") ) {
                    document.getElementById("aboutDialog").close();
                    document.getElementById("aboutDialog").innerHTML='';
                    $("#prjAllFilesID").prop("disabled",false);
                    //lastScreen=window.location.hash.slice(1);   // restore the previous value
                    $('#aboutDialog').attr('name',"");  // reset the name so any subsnth-childuent handler from aboutDLG will not get tangled
                    activeTreePane = "FILES"; // reset the active
                }
                $("#result-table1").removeClass("greyed-out");
            break;

            case "closeSystemDlg"   :
                document.getElementById("aboutDialog").close();

            break;

            case "permissionsID"         :
                permisssions();
            break;

            case "foldersID"             :
                foldersMngmnt();
            break;

            case "newEstimatesBtn"       :
                if ( ($("#EstimatesPane tbody tr").length) == 0 )  // now rows displayed then show header
                    //const out = ;
                    $("#EstimatesPane").html(headers["Estimates"]["columns"]);
                newEstimate(event);
            break;
                
            case "newLeadsBtn"           :
                newLead();
                currCell = $("#LeadsPane tr:last td:nth-child(2)").first();
            break;

            case "newProjectsBtn"        :
                const idToPane={"newLeadsBtn":"Leads","newEstimatesBtn":"Estimates","newProjectsBtn":"Projects"};
                const pane=idToPane[event.target.id];

                if ( ($("#"+pane+"Pane tbody tr").length) == 0 )  // no rows displayed then show header
                    //const out = ;
                    $("#"+pane+"Pane").html(headers[pane]["columns"]);
                
                addNewRow("#"+pane+"Pane",pane,$("#"+pane+"Pane tbody tr").length,false); // put out the header and an empty row
                if ( pane == "Projects" ) // only in Projects focus on the 2nd field not allowing to change the project number
                    currCell = $("#"+pane+"Pane tr:last td:nth-child(2)").first();
                else
                    currCell = $("#"+pane+"Pane tr:last td:nth-child(1)").first();
                currCell.children().first().focus();
               // else
               //     addNewRow("#"+$(event.target).parents('table')[0].id,handlerToPane[event.target.id],$(event.target).parents('table')[0].rows.length,false);
            break;
            
            case "prjctNumberID"        :
                //if ( lastScreen == "Customers" ) { // just aas a precausion 
                const entryNumber=Projects.arrProjects.findIndex(t => t.project_number == Number(event.target.value));
                if ( entryNumber != -1 ) 
                    showProjectSummary(entryNumber);
                //}

            case "cstmrUploadFileID"    :
            case "LeadFileID"           :
            //case "leadUploadFileID"     :
                const idToTable={"cstmrUploadFileID":{table:"customerTblID",module:"Customers"},
                                 "LeadFileID":{table:"leadsTblID",module:"Leads"}};
                let tableID='#'+idToTable[event.target.id]['table'];
                
                let filesBtn = $("#"+event.target.id);

                const cID=$(tableID).find('[id='+headers[idToTable[event.target.id]['module']]['primaryKey']+']').text(); //$("#"+headers["Customers"]['primaryKey']).text();
                const cEnnry=classArray[idToTable[event.target.id]['module']].arr.findIndex(t => t.customer_id == cID);

                //cEntry == -1!!!!
                if ( Number(classArray[idToTable[event.target.id]['module']].arr[cEnnry].file_uploaded) ) // if there are any files than add the option to show the files 
                    filesBtn.html("<select id='selectFiles' class='filesSelect button'><option value='uploadFiles'>Upload Files</option><option value='showFiles'>Show Files</option></select></seelect>")
                else {
                        filesBtn.removeClass("button").prop("disabled",true);
                        customerPanes.map(function(pane) {  // loop
                            $("#new"+pane+"Btn").removeClass("button").prop("disabled",true); // disable all new lead/estimate/project button
                        });
                        showFileUpload(event.target,headers[idToTable[event.target.id]['module']]["callType"],"fileUploadControl",lastScreen);
                }
                
            break;

            case "selectFiles"      :
                windowLog.trace("Uploadfile option:"+$("#selectFiles :selected").val());
            break;

            case "adrsLine2"        :
                if ( event.target.value === "apt/floor" )
                    event.target.value = "";    // reset the field to allow typing

            break;

            case "notes"           :
            break;

            case "closeFileUpload" :
                windowLog.trace("aboutDLG: close DLG");
                if ( lastFocusedEntry.length > 0 ) {    // greater than 0 means there is a last focused entry to return to
                    $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).removeClass("greyed-out");
                    currCell=lastFocusedEntry[lastFocusedEntry.length-1].currCell;
                }
                else
                    $("#main-menue,#naviID").removeClass("greyed-out");
                $(this).hide();
                currCell.children().first().focus();
                //$(currCell).closest('table').removeClass("greyed-out");
            break;

            case "submitFilesID"    :
                onSubmitUploadFiles(); 
            break;

            default                 :
                if ( event.target.id.includes("focusableElement") ) {
                    windowLog.trace("Clicked on list");
                    $('#overLay ul li')[event.target.id.split("-")[1]].focus();
                } else
                    windowLog.trace("Default click:"+event.target.id);
        }
    });

    $("#estimateDlg").on('click',function(event)    { //#fileUploadControl,

        windowLog.trace("Inside flieUpload and estimateDlg handler:"+event.target.id);
        
        switch (event.target.id) {

            //case "saveEstmateBtn"   :   // first do the save and follow the close tasks
            case "closeEstmateBtn"  :
                charactersCount=0;
                closeEstimateScreen()
            break;

            case "resetEstmateBtn"  :
                resetEstimateScreen();
            break;

            case "emailEstmateBtn"  :
                windowLog.trace("Not yet supported");
            break;

            case "pdfEstmateBtn"   :
                windowLog.trace("Not yet supported");
                //estimate2PDF();
            break;

            case "printEstmateBtn"  :
                windowLog.trace("Not yet supported");
            break;

            case "submitFilesID"    :
                onSubmitUploadFiles(); 
            break;

            case "closeFileUpload"  :
                closeFileUploadScreen();
                //$("#result-table1").removeClass("greyed-out");
                charactersCount=0;
                $(".editCntrlClass").hide();
                if ( $("#aboutDialog").is(":visible") ) {   // only apply when the customers dialog is open
                    let cID=$("#customerTblID").find('[id="customer_id"]').text();//$("#"+headers["Customers"]['primaryKey']).text();
                    const cEnnry=classArray["Customers"].arr.findIndex(t => t.customer_id == cID);
                    if ( Number(classArray["Customers"].arr[cEnnry].file_uploaded) ) { // if there are any files than add the option to show the files 
                        let filesBtn = $("#cstmrUploadFileID");
                        filesBtn.html(uploadFilesMngr(1,true));  // update the button to select with upload and show files
                        $("#selectFiles").prop("disabled",false);    // disable click while upload files dlg is open 
                    }                
                    customerPanes.map(function(pane) {  // loop throu the panes 
                        $("#new"+pane+"Btn").addClass("button").prop("disabled",true); // Gil // enable all new lead/estimate/project button
                    });
                    $("#cstmrUploadFileID").addClass("button").prop("disabled",false);
                } /*else
                    $("#result-table1,#result-table").removeClass("greyed-out");*/
            break;

            case "resetFormID"      :
                onResetUploadFiles(event);
            break;

            case "estimateUploadFileID" :
                break;
        }
    });

   

    /**$( "body" ).delegate("#notesID","keyup",function(event) {

        comment in till further notice
        if ($("#notesID").val().length > 0) {
           // $("#emailEstmateBtn,#printEstmateBtn,#pdfEstmateBtn").addClass("button").prop("disabled",false);
        }

        else 
            $("#emailEstmateBtn,#printEstmateBtn,#pdfEstmateBtn").removeClass("button").prop("disabled",true);
        
        windowLog.trace("Inside Notes keydown");
    }); **/

    $("#aboutDialog").on('dblclick', '#jstree', function(e) {

        windowLog.trace("double click:"+e.target.id);
        let fileName="";
        var regex=/^f_/s;
        const isFile=regex.test(e.target.id);
        if ( isFile ) {
            function constructPath() {
                var path="";
                if ($(this).attr("id").includes("d_")) {
                  //console.log($(this).attr("id"));
                  path=$(this).attr("id").slice(2);
                  return path;
                }
            }
            var parentFolder="";
            var temp=$(e.target).parents('.jstree-node').map(constructPath);  // get all the parents to construct the folder path
            for (var i= (temp.length)-1; i >=0; i--) { // -2 to strt from the 2nd parent
                parentFolder+=temp[i].slice(temp[i].indexOf("_")+1);
                if ( i > 0 )
                    parentFolder += "/";  // add the seperator except if this the last element
            }
                //console.log($(this).attr("id"));
            //path=$(this).attr("id").slice(2);
            fileName=e.target.innerText;
            windowLog.trace("dblClk filename:"+fileName);
                //parentFolder += "/";  // add the seperator except if this the last element
            $("#fileThumbnailID").html(`<img src='${appConfig.root_projects+parentFolder+"/"+fileName}' id="tnID" value="tnImage"  width='100%' height='100%'></img>`);
          }
    });

    $("body").delegate("#prjShortCut,#cstmrShortCut","keydown",function(event) {
        windowLog.trace("Invoking keydown handler(id):"+this.id);
        const inValidKey=event.ctrlKey || event.metaKey || event.key === "Tab" || event.key === "Alt"; //|| exceptionKeys(event.key);
        if ( !(event.currentTarget.closest('table').id === "innerCellID" && inValidKey) ||
              $('#overLay ul li').length > 1 ) {
                TblKeyDown(event);
                event.stopPropagation();// stop the bubbling
            }
    });

    $("body").delegate("#aboutDialog,#estimateDlg,#newSingleRec","keydown",function(event) {
        windowLog.trace("Invoking keydown handler:"+this.id);
        TblKeyDown(event);
        /*if ( $('#editCBID').is(":checked") || exceptionKeys(event.key) )*/
        /*else {
            if (event.key != "Tab") {
                windowLog.trace("Keydown has been denided,stop Prop - edit mode is off");
                event.preventDefault();
                $(this).addClass("greyed-out");
                enableEditDlg(this);
            }
        }*/
    });

    $("body").delegate("#customerTblID", "keyup", function(event) {
        windowLog.trace("Invoking customerTblIDKeyup handler");
        let totalLength = 0;
        $("#customerTblID input:gt(0)").each(function() {
            totalLength += this.value.length;
        });
        totalLength += $('#'+cstrIDtoProperty.notesID).val().length; // add the notes char length
        windowLog.trace("Total length:"+totalLength);
        if ( charactersCount && totalLength && ( $('#overLay ul li').length == 0 ) ) {  // only if any valid char typed (for exampke, letter in zip are invalid)
            $("#"+cstrIDtoProperty.state).prop("disabled",false);
            //let saveRetValue=save(event.target);    // call save handler  ($("#yourElement").is(":visible"))
            if ( !$("#new"+customerPanes[0]+"Btn").is(":visible")) { // only set to false if not already set 
                $("#cstmrUploadFileID").toggle(); // uplaod file button of Custoemrs
                customerPanes.map(function(pane) {  // loop over the panes
                    $("#new"+pane+"Btn").toggle();
                });
            }
        }
        else {
            if ( $("#new"+customerPanes[0]+"Btn").is(":visible") ) {
                $("#cstmrUploadFileID").toggle();
                customerPanes.map(function(pane) {  // loop
                    $("#new"+pane+"Btn").toggle();
            });
            }
        }
    });

    function exceptionKeys(key) {

        let decision =false;
        switch (key) {

            case "Tab"          :
            case "ArrowUp"      :
            case "ArrowDown"    :
            case "Enter"        :    
                decision = true && ( $("#editControl").css("visibility") === "hidden" ); //override the key if the edit msg i showing
            break;
        }

        return decision;

    } 

    function innerPThandler(event) {

        windowLog.trace("innerPThandler:"+event.target.id);

        switch (event.target.id) {

            case "prjAllFilesID"    :

                $("#prjAllFilesID").prop("disabled",true);
                showTree($("#jName").html());   // call the tree with the individual project name

            break;

            case ("pEJ_ID")    :
                pEmployeeJobs();
                break;

            case ("pCJ_ID")    :
                pContractorJobs();
                break;

            case ("pPrcs_ID")    :
                pPurchases();
                break;

            case "CloseBtnPsumry"   :
                closeProjectSummary();

            default:
                windowLog.trace("innerPThandler-default:"+event.target.id);
        }
        return false;
    }

    function dispatcher(e) {

        var lookupID="";
        windowLog.trace("Inside dispatcher click:"+e.target.id);
        const id=e.target.id.substr(0,e.target.id.indexOf("-")) != "" ? e.target.id.substr(0,e.target.id.indexOf("-")) : e.target.id;
        switch ( id ) {
        
            case "upperLeft"        :
            case "ul"               :
                lookupID = "upperLeft";
                if (username == 'eddie') {
                    window.location.hash = headers[captions[screenNumber][captions["genesis"].indexOf(lookupID)]].hash;
                    /*if (screenNumber === "home")
                        window.location.hash = headers["Employee Jobs"].hash;
                    else
                        window.location.hash = headers["Employees"].hash;*/
                }
                else 
                    captions["handlers"][captions["genesis"].indexOf(lookupID)]();
            break;
    
            case "upperRight"       :
            case "ur"               :
                lookupID = "upperRight";
                if ( username === 'eddie' ) {
                      window.location.hash = headers[captions[screenNumber][captions["genesis"].indexOf(lookupID)]].hash;
                   /* if ( screenNumber === "home" )
                        window.location.hash = headers["Purchases"].hash;
                    else
                        window.location.hash = headers["Vendors"].hash;*/
                  
                } 
                else
                    upperRight();
            break;

            case "lowerLeft"            :
            case "ll"                   :
                lookupID = "lowerLeft"  ;
                if ( username == 'eddie' ) 
                /* if ( username == 'eddie' ) {
                    if ( screenNumber === "home" )
                        window.location.hash = headers["Purchases"].hash;
                    else
                        window.location.hash = headers["Vendors"].hash; */
                    window.location.hash = headers[captions[screenNumber][captions["genesis"].indexOf(lookupID)]].hash;

                else
                    lowerLeft();
            break;
    
            case "lowerRight"           :
            case "lr"                   :
                 lookupID = "lowerRight";
                 if ( username == 'eddie' ) 
                     window.location.hash = headers[captions[screenNumber][captions["genesis"].indexOf(lookupID)]].hash;
                    /*
                    if ( screenNumber === "home" )
                        window.location.hash = headers["Purchases"].hash;
                    else
                        window.location.hash = headers["Vendors"].hash;*/
                
                else
                    lowerRight();
            break;

            case "mainNewTaskSchdlr"    :
                $("#main-menue,#navID,#tHalf,#innerCellID").addClass("greyed-out");
                $('img[id^="Pls"]').removeClass("greyed-out");
                $("#overLay ul").attr('data-module',"Scheduler");
                addNewRec("Scheduler",e.target,"addSingleRec"); // called from the main menue to create. new (scheduler) task
                $("#overLay ul").attr('data-module',"");
            break;

            case "newCustomer"          :
                showCustomer(-1,e.target.id);   // -1 flag empty record to show
                // call to add new record
            break;

            case "Pls"                  :
                const quadrant=e.target.id.substr(e.target.id.indexOf("-")+1)
                $("#main-menue,#navID,#tHalf,#innerCellID").addClass("greyed-out");
                $('img[id^="Pls"]').removeClass("greyed-out");
                $("#overLay ul").attr('data-module',captions[screenNumber][captions["shortcuts"].indexOf(quadrant)]);
                addNewRec(captions[screenNumber][captions["shortcuts"].indexOf(quadrant)],e.target,"addSingleRec");  
            break;

            case "newProject"           :
                $("#main-menue,#navID,#projects,#tHalf,#innerCellID").addClass("greyed-out");
                $("#overLay ul").attr('data-module',"Projects");
                $('img[id^="Pls"]').removeClass("greyed-out");
                addNewRec("Projects",e.target,"addSingleRec");
                //$("#overLay ul").attr('data-module',"");
            break;
            
            case "estimates"            :
            case "estimatesID"          :
                window.location.hash = headers["Estimates"].hash;
            break;

            case "customers"            :
            case "customersLbl"         :
                window.location.hash = headers["Customers"].hash;
            break;
    
            case "projectLbl"           :
                window.location.hash = headers["Projects"].hash;
            break;
                
            case "prjShortCut"          :
                $("#overLay ul").attr('data-module',"Project Number");
                $("#cstmrShortCut").val("");
                if ( e.type === "keydown") {
                    //const entryNumber=Projects.arrProjects.findIndex(t => t.project_number == Number(event.target.value));
                    //if ( entryNumber != -1 ) 
                    //    showProjectSummary(entryNumber);
                }

            case "cstmrShortCut"        :
                $("#prjShortCut").val("");
                $('#overLay ul').empty();
                $("#"+e.target.id).focus();
                $("#overLay ul").attr('data-module',"");
            break;

            case "inputfileID"          :
            case "prjLabelID"           :
            case "uHalf"                :
            case "cText"                :       
            break;    

            case "centerTXT"            :
                if (( username == 'eddie' )) //only Eddie could access
                    window.location.hash = headers["Projects"].hash;
            break;

            case "schedulerLabelID"     :
                window.location.hash = headers["Scheduler"].hash;
            break;

            case "bHalf"                :
            case "tHalf"                :
                $("#"+e.target.id).find('input').focus();

                /*if (username === 'eddie') { //only Eddie could access
                    switch ( window.location.hash ) {
                        case "#home"    :  
                            screens[2]();
                        break;
    
                        case "#config"  :
                            screens[1]();
                        break;
                    }
                }*/
            break;

            case "allFilesID"           :
            
                if ( screenNumber === "config" )//captions[2].includes(lastScreen) )   // is the screen in configuration?
                    showFileUpload(e.target,"configurationUpload","aboutDialog",lastScreen);
                else {
                    if ( $(e.target).closest('tr').find('[id^="prjctNumberID"]').val() != "" )   // only upload when project name is valid
                        showFileUpload(e.target,"generalUpload","aboutDialog",lastScreen);
                    else
                        windowLog.trace("Project name field is empty - ignore");
                }
                e.stopPropagation();
            break;

            case "addressNextTask"      :   // open google maps of the job address, access from the job address hyperlink
                window.open("http://maps.google.com/?q="+e.target.text,"_blank");
            break;

            case "rootID"       :   // home
                screenNumber="home";
                window.location.hash = headers["Home"].hash;
            break;

            case "libraryID"    :
                showTree(0); // 0 means root of all projects
            break;

            case "logout"       :
                logout();
            break;

            case "configID"     :
                screenNumber="config";
                window.location.hash = headers["Configuration"].hash;
            break;

            case "systemID"     :
                system();
            break;

            case "welcomeNameID" :
                profile();
            break;

            default:
                windowLog.trace("default click: "+e.target.id);
        }
    }

    $("#main-menue,#navID,#innerCellID").on('click',function (e) {  // disable any firther clicks handlerClick(e) {

        windowLog.trace("inside handler click:"+e.target.id);
        
        dispatcher(e);

        return false;
    });

    // event listner of mouse click
    $("#result-table1").on("click", "td", function(event) {

        windowLog.trace("Inside #result-table1 click "+this.closest('table').id);
        if ( this.closest('table').id == 'result-table1')
            windowLog.trace("Inside click result-table1 TD-element, Header:"+$('#result-table1 thead tr th:nth-child('+this.cellIndex+')').text());
        
        currCell=$(event.target).closest('td'); // Identify the TD
        switch ( event.target.id ) {

            case "allFilesID"       :
                if ( $('#editCBID').is(":checked") ) {    // is in edit mode?
                    if ( screenNumber === "config" )    // is the screen in configuration?
                        showFileUpload(event.target,"configurationUpload","aboutDialog",lastScreen);
                    else {
                        //if ( $(event.target).closest('tr').find('[id^="prjctNumberID"]').val() != "" )   // only upload when project name is valid
                            showFileUpload(event.target,"generalUpload","fileUploadControl",lastScreen);
                        //else
                        //    windowLog.trace("Project name field is empty - ignore");
                    }
                }
                else {
                    //event.preventDefault(); // prevent edit the date
                    
                    //$("#"+event.delegateTarget.id).addClass("greyed-out");
                    //enableEditDlg(event);
                }

             break; 

            case "prjctNumberID"    :
                const entryNumber=Projects.arrProjects.findIndex(t => t.project_number == Number(event.target.value));
                if ( entryNumber != -1 ) 
                    showProjectSummary(entryNumber);
            break;

            case "jobDateID"        :
            case "invoiceDateID"    :
            case "pymntDateID"      :    
                if ( !$('#editCBID').is(":checked") ) {
                    event.preventDefault(); // prevent edit the date
                    windowLog.trace("Ignore mousedown..editMode:off");
                    //$(this).addClass("greyed-out");
                    enableEditDlg(event);
                }
            break;

            case "isActEmplID"      :
                if ( !$('#editCBID').is(":checked") ) {
                    windowLog.trace("Ignore mousedown..editMode:off");
                    event.preventDefault();
                    //$(this).addClass("greyed-out");
                    enableEditDlg(event);
                }
                else
                    updateIsActive(event);

            break;

            case "hrValueID"        :
                window.location.hash = headers["Hourly Rate"].hash;
                headers["Hourly Rate"].params=$(this).closest('tr').find('[id='+headers[$("#screen_name").html()]["primaryKey"]+']').val();
                //retCode=showHR($(this).closest('tr').find('[id='+headers[$("#screen_name").html()]["primaryKey"]+']').val());
                break;
            
            case "hrDateID"         :
                break;

            case "customer_id"      :   // show the customer screen
                customerRow=event.target.closest("tr");
                showCustomer(classArray["Customers"].arr.findIndex(t => t.customer_id == $(this).find('input').val()),event.target.id);

            case "unAssgnTskDateID"  :
                
                //$("#result-table").addClass("greyed-out");
                break;

            case "assignID"         :
                
                /*if ( ( new Date(msg.data.taskDate) == new Date($("#result-table thead tr").find('th:nth-child('+((msg.target.closest('td').cellIndex))+')').html()) ) && 
                    ( $(msg.data.elementID).closest('tr').children().first().text() == msg.data.name) )  {
                    const aboutDialog=document.getElementById("aboutDialog");
                    var errorMsg = "<center><p>Not allowed to assign task at the same day</p>";
                    errorMsg += "<center><p>for the same employee</p>";
                    errorMsg += `<center><input type="button" value="Ok" onclick="aboutDialog.close();";><center><br>`;
                    aboutDialog.innerHTML=errorMsg;
                    aboutDialog.showModal();
                } else */
                    reAssignTask(event.target); // used for unassigned

                break;

            case "editTaskID"       :       // used by edit assigned tasks  
                //$("#result-table").addClass("greyed-out");  // grey-out the scheduler to prevent from user clicks in the scheduler
                $("#main-menue,#navID,#tHalf,#innerCellID,#result-table").addClass("greyed-out");
                $('img[id^="Pls"]').removeClass("greyed-out");
                addNewRec("Scheduler",event.target,"addSingleRec");    // Called from the Scheduler only, pass the target to identify the row to allow populate the record in case of non empty fields 
                $("#SaveNewBtn,#SaveCloseBtn").show();
                break;

            case "moveUPTask"       :
            case "moveDownTask"     :
                reorderElement(event.target,event.target.id);
                break;

            case "emplColorInputID"   :
                if ( !$('#editCBID').is(":checked") ) { 
                    windowLog.trace("Ignore mousedown..editMode:off");
                    event.preventDefault();
                    enableEditDlg(event);
                }
                break;

            default                 : 
                windowLog.trace("Placeholder(do nothing): "+event.target.id);
        }
        if ( (typeof event.target.type != "undefined") && 
             (event.target.type.includes("text") ) ) // cover text and textarea
            origText=event.target.value;
    }); 
  
    /*
    $('.scrollit').on('scroll', function(event) {
        //isScroll=true;
        //const Ratio= (($('.scrollit').scrollTop()/maxScroll)*100).toFixed(2);
        //windowLog.trace("Scroll value:"+$('.scrollit').scrollTop().toFixed(2)+" "+Ratio+"%");
    //  recRatio=Math.round(numberofRec*Ratio);
        //windowLog.trace("recRatio="+recRatio);

        //minRec=Math.max(recRatio-200,0);
        //maxRec=Math.min(recRatio+200,numberofRec);
        /*
        windowLog.trace("min="+minRec+" max="+maxRec);
        if ( minRec == 0) 
            windowLog.trace("Reached the first record");

        if ( isScroll !== null ) {
            clearTimeout(isScroll);  
            //windowLog.trace("Clear timeout");
            isScroll=null;  
        }
        else
            isScroll = setTimeout(function() {
                const slidingWindow=refreshProjects(minRec,maxRec);
                windowLog.trace("No scroll");
                //windowLog.trace("no scrolling");
            }, 2000);
            */


    var lastRow=0;
    var mouseLeave=false;
    function mouseOverHandler(e) {

        //windowLog.trace("Inside mouseOverHandler: id="+e.currentTarget.id);
        switch ( e.currentTarget.id ) {
           // case "searchDivID" :   
           // break;

            default:
                if ( mouseLeave) {
                    $('#result-table1 tbody tr:nth-child('+(lastRow-1)+')').css({"border": '1px solid black'});
                    mouseLeave=false;   // reset 
                }
                if ( ( e.target.nodeName == "TD" )      || 
                    ( e.target.nodeName == "INPUT" )   || 
                    ( e.target.nodeName == "TEXTAREA" ) ){
                    windowLog.trace("Inside mouseOverHandler: id="+e.target.id+" row Index:"+e.target.closest('tr').rowIndex);
                    lastRow=e.target.closest('tr').rowIndex;
                }
                //else
                    //windowLog.trace("Inside mouseOverHandler: nodeName:"+e.target.nodeName);
        }
    }

    function mouseLeaveHandler(e) {

        windowLog.trace("Inside mouseLeaveHandler: id="+e.currentTarget.id);

        /*switch ( e.currentTarget.id ) {

            case "searchDivID" :
                $("#searchID").html("<td></td>");
            break;

            default:
                mouseLeave=true;
                windowLog.trace("Inside mouseLeave, lastRow="+lastRow);
                $('#result-table1 tbody tr:nth-child('+(lastRow-1)+')').css({"border": '1px solid #098207'});    
            break;    
        }*/
    }


    function mouseEnterHandler(e) {

        windowLog.trace("Inside mouseenter");
        /*
        switch ( e.currentTarget.id ) {

            case "searchDivID" :
               // addSearchHeader();
            break;
        }*/
    }

    /*
    if ($('#editCBID').is(":checked")) {

    }*/

    function prjNumberSmryHandler(e) {

        windowLog.trace("Inside prjNumberSmryHandler");

    }

    function updateIsActive(e) {

        windowLog.trace("Inside updateIsActive");
        windowLog.trace("updateIsActive, new isActive value:on");
        save(e.target,1);
        charactersCount=0;
    }

    function assignTaskHandler(msg) { 

        const exportDialog=document.getElementById("aboutDialog");
        let taskDate = msg.data.taskDate;
        if ( msg.data.taskDate == "" ) { 
            taskDate = "unassigned Date";
            msg.data.taskDate = dummyDate; // set to dummy date to allow comparison
        }

        let assignString="assign";
        if ( msg.data.eID  !== "newTaskSC" )
            assignString = "re" + assignString; // when it is NOT a new tsk then it is a reassing task 
        out = `<center><p class="label1">Are you sure you want to `+assignString+` the job to <label class="taskResult">`+msg.data.name+`</label></p>`;
        out += `<p>project number:<label class="taskResult">`+msg.data.projectNumber+`</label></p>`;
        out += `<p>description:<label class="taskResult">`+msg.data.taskDescription+`</label></p>`;
        out += `<p>at:<label class="taskResult">`+taskDate+`</label></p><br>`;
        out += "<center<br><input type='button' class='button' value='No' id='assignNo'/>&nbsp<input type='button' class='button' value=Yes' id='assignYes' /></center>";
        exportDialog.innerHTML=out;

        exportDialog.showModal();

        $('#assignYes').on('click',{name            : msg.data.name,
                                    eID             : msg.data.eID,
                                    projectNumber   : msg.data.projectNumber,
                                    taskIX          : msg.data.taskIX,
                                    taskDate        : msg.data.taskDate,
                                    taskDescription : msg.data.taskDescription,
                                    elementID       : msg.data.elementID,   // element id, will be used to be deleted after assignemt to the resource.
                                    taskID          : msg.data.taskID},Yes);
        $('#assignNo').on('click',No);

        function Yes (msg) {

            const tToday=new Date();
            var newTask=false;
            let retSave=false;
            const currentTime=tToday.getHours()+ ":" + String(tToday.getMinutes()).padStart(2,'0')+ ":" + String(tToday.getSeconds()).padStart(2,'0');

            //var overRide = false;  // defult override, false when the new task status is unassigned
            let resultT = msg.data.taskIX; // index of the task in the Tasks.arrTasks array
            if ( resultT == -1 ) {// new task
                Tasks.arrTasks.push ({ task_id: msg.data.taskID, employee_name: "", employee_id: "", task_date: "", task_description: "", seq_number: 0, task_status: "open" , file_upload: "0", inid: "0"});
                resultT = Tasks.arrTasks.length - 1;  // set the resultT to the new task index
                newTask=true;
            } else // only if this not a new task then reset 
                $($(msg.data.elementID)).closest("td").css("background-color","#ffffff"); // reset the cell background
            
            let lastElementIdx = 1;
            let suffix,assgnTaskDate=dummyDate,dayNumber=0;
            if ( msg.data.taskDate !== dummyDate ) {
                 assgnTaskDate=new Date(msg.data.taskDate+"T00:00:00");
                 dayNumber=((new Date(msg.data.taskDate+"T00:00:00")).getDay())-1;  // decrease 1 since Monday is 0 where getDy sundy is 0
            }
            
            if ( msg.data.name !== "unassigned"  &&
                 msg.data.taskDate !== dummyDate )
            {
               /* iRow=$("#result-table tr:last").index(); // point to the last row which is unassigned
                dayNumber=$("#result-table tr:last td:last").index();
                suffix =`-${iRow}-${dayNumber}-`;*/
            
                //else {
                iRow = div_counter_arr.findIndex(t => t[0] == msg.data.name);    // get the corresponding row to the employee name to add the new element'
                suffix =`-${iRow}-${dayNumber}-`; 
                lastElementIdx=Number($("#imgpls"+suffix+"0").closest('td').find('input[name="projectNumber"]').last().attr('id').split("-")[3]);
            }
            Tasks.arrTasks[resultT].employee_name=msg.data.name;    // update the task employee name and employeeidid
            Tasks.arrTasks[resultT].employee_id=classArray["Employees"].pNames[msg.data.name];
            Tasks.arrTasks[resultT].task_date=msg.data.taskDate+" "+currentTime; //task_dateformatDateForInput(new Date(msg.data.taskDate))+" "+currentTime; // update the task date
            Tasks.arrTasks[resultT].task_description=msg.data.taskDescription;
            Tasks.arrTasks[resultT].seq_number=lastElementIdx;
            Tasks.arrTasks[resultT].project_name=msg.data.projectNumber;
            Tasks.arrTasks[resultT].project_number=msg.data.projectNumber.split('-',1)[0];  //projectNumber;,
            Tasks.arrTasks[resultT].is_assigned = ( (msg.data.name === "unassigned" || msg.data.taskDate === dummyDate)?0:1);

            let tempT=-1;
            if (msg.data.eID !== "newTaskSC") 
                tempT = assignedTasksArr.findIndex(t => t.task_id === msg.data.taskID);

            if ( msg.data.name !== "unassigned"  &&
                 msg.data.taskDate !== dummyDate ) {   // if case of unassigned, dont care about dates etc
                const headerArr=$('#result-table thead tr th:gt(0)');
                mondayOfWeek=new Date(headerArr[0].innerText);
                SundayOfWeek=new Date(headerArr[6].innerText);
             
                if ( ( assgnTaskDate >= mondayOfWeek ) &&
                     ( assgnTaskDate <= SundayOfWeek ) ) {    // is the new date visible 
                   
                    if ( ( div_counter_arr[iRow][dayNumber+1] == 0 ) && // dest cell has a single entry
                         ( $("#imgpls"+suffix+"0").closest('div').find('input[name="taskID"]').val() == "0") ) // task_id == 0
                            div_counter_arr[iRow][dayNumber+1] = -1; // Set to -1 since addElement will increament by 1 which will set the value to 0 
                                                                // tell the addElement to copy the task details and not adding a new element
                    //$("#imgpls"+suffix+"0").closest('div').find('input[name="taskID"]').val() // task it of the 1st element
                   
                    //Tasks.arrTasks[resultT].task_description=$(msg.data.elementID).parent().siblings().find('textarea[name="schdPrjctDscrptn"]').val();
                    addElement(document.getElementById("imgpls"+suffix+lastElementIdx),resultT,true); //element counter is updated inside addelement function 
                }
                assignedTasksArr.push({    // add the new element to the assigned element
                          employee_id       :   Tasks.arrTasks[resultT].employee_id,  // empID is taken from the employee.pNames array
                          employee_name     :   Tasks.arrTasks[resultT].employee_name,
                          project_address   :   Tasks.arrTasks[resultT].project_address,
                          project_name      :   Tasks.arrTasks[resultT].project_name,
                          project_number    :   Tasks.arrTasks[resultT].project_number,  //projectNumber;
                          task_date         :   Tasks.arrTasks[resultT].task_date,///formatDateForInput(date)+" "+cTime, //Convert the JS date to mySQL date before sending )sqlDate
                          task_description  :   Tasks.arrTasks[resultT].task_description,  // obtain the text area  textArea=$("#tx"+this.id.slice(2)).val();
                          task_id           :   Tasks.arrTasks[resultT].task_id, // task_id is the task id of the task that has been assigned
                          task_status       :   Tasks.arrTasks[resultT].task_status,
                          inid              :   Tasks.arrTasks[resultT].inid,
                          file_uploaded     :   Tasks.arrTasks[resultT].file_uploaded,
                          is_assigned       :   "1", // msg.data.assignmentOverride)??
                          seq_number        :   Tasks.arrTasks[resultT].seq_number});
            }
            else {
                if (tempT > -1) 
                    assignedTasksArr.splice(tempT,1);   // remove the task from the assignedlist
                //Tasks.unAssignedCount++
                addUnassignedTask(Tasks.arrTasks[resultT]); // inside here a call to savechedukler is done 
                iRow=$("#result-table tr:last").index(); // point to the last row which is unassigned
                dayNumber=($("#result-table tr:last td:last").index());
                dayNumber--;
                suffix =`-${iRow}-${dayNumber}-`;
                lastElementIdx=1;
                newTask = true;
            }
            retSave = saveScheduler(document.getElementById("imgmns"+suffix+lastElementIdx),Tasks.arrTasks[resultT].is_assigned,newTask); 
                                                    
            if ( Number(Tasks.arrTasks[resultT].is_assigned) && msg.data.eID !== "newTaskSC" ) {   //  single cell
                delElement(document.getElementById(msg.data.elementID),"promptOveride"); 

                //div_counter_arr[$(msg.data.elementID).closest("tr").index()][$(msg.data.elementID).closest("td").index()]--; //decrease by 1

                /*$(msg.data.elementID).find('#activeEmplListID').hide();      // hide the empl list element
                $(msg.data.elementID).find('#unAssgnTskDateID').hide();      // hide the assign label 
                $(msg.data.elementID).parent().siblings().find('[id="assignID"]').hide(); // hide the assign label
                $(msg.data.elementID).find('input[name="projectNumber"]').val(""); // reset the project number
                $(msg.data.elementID).parent().siblings().find('textarea[name="schdPrjctDscrptn"]').val(""); // reset the description
                $(msg.data.elementID).find('input[name="projectNumber"]').css({'border':'2px solid '+color});
                $(msg.data.elementID).parent().siblings().find('textarea[name="schdPrjctDscrptn"]').css({'border':'2px solid '+color});
                $(msg.data.elementID).find('input[name="taskID"]').val("0");
                */
                //$(msg.data.elementID).closest('td').css("background-color","#f8f7f3"); // reset the background color// reset the background color
                //div_counter_arr[$(msg.data.elementID).closest("tr").index()][$(msg.data.elementID).closest("td").index()]=-1; 
            }
            else {
                if ( msg.data.name != "unassigned")// ( ("#"+$(msg.data.elementID).closest("tr").attr("id") != "unAssignElementsTR")  // if the row is unassigned row
                   
                    if ( msg.data.eID  !== "newTaskSC") {
                        $("#"+msg.data.elementID).parent().remove();    // remove the input and buttons
                        $("#tx"+$(msg.data.elementID).parent()[0].id).closest('td').remove();
                    }
            }
            origText="";
            document.getElementById("aboutDialog").close();     // close the modal box
        }

        function No () {
            document.getElementById("aboutDialog").close();
        }
    }

    function editHandler() {

        windowLog.trace("Inside Edit handler");
        ``
        if ( this.id === "yesBtn") {
            $("#editCBID").prop("checked", true ); // turn on edit mode
            if ( lastScreen === "Scheduler" )
                $("[id=editTaskID").removeClass("greyed-out").prop("disabled",false);   // enable all Edit task button
        }

        $("#editControl").html("");
        $("#editControl").hide();
        $("#navID,#result-table,#result-table1,#editLabel").removeClass("greyed-out");

        if ( lastScreen !== "Customers" )
            setCellFocus(); // return the focus back to the original field
    }

    function enableEditDlg(e) {

        var out="";
        
        out = `<center><p class="label1">Not in Edit mode</p></center>`;
        out += `<center><p class="label1">Do you want to enable Edit mode?</p></center><br>`;
        out += `<center><input type="button" class="button" value="No" id="noBtn"/>&nbsp<input type="button" class="button" value="Yes" id="yesBtn"/></center>`;
       
        $("#navID,#result-table,#result-table1,#editLabel").addClass("greyed-out");
                    
        $("#editControl").html(out);    // show the dialuge
        $("#editControl").show();
        $('#yesBtn').focus();  

        $('#yesBtn,#noBtn').on('click',editHandler);
        /*$('#yesBtn,#noBtn').on('keydown', function(event) {
            $("#navID,#result-table,#result-table1,#editLabel").addClass("greyed-out");

            switch (event.key) {
                case "y"        :
                case "Y"        :
                    $("#editCBID").prop( "checked", true );
                    if ( lastScreen == "Scheduler" )
                        $("[id=editTaskID").removeClass("greyed-out").prop("disabled",false);   // enable all Edit task button
                case "Escape"   :
                case "n"        :
                case "N"        :    
                $("#editControl").html("");
                $("#editControl").hide();
                if ( lastScreen !== "Customers" )
                    setCellFocus(); // return the focus back to the original field
                break;
        }}); */

      
    }

    function uploadFilesCheckBoxHandler(e) {

        windowLog.trace("Inside uploadFilesCheckBoxHandler");
        oldfile=[];	// reset the oldfiles array
        if ( document.getElementById("userFileUpload").checked )  	// in case file uploaded has been selected
            showFileUpload(e.target,"userJobUpload","fileUploadControl",""); // add parent folder
        //else
        //    document.getElementById("uploadFilesID").hidden=true; // unhide the new record screen
    
        return false;
    }

    $(window).blur(function() {
        isTargetWindow = true;
        windowLog.trace("window blur");
    });

    $(window).focus(function() {
        isTargetWindow = false;
        windowLog.trace("window focus");
    });

    const floatingMessage = document.getElementById('floating-message');

    /*document.addEventListener('contextmenu', function(e) {
  
        e.preventDefault();

        // Position the floating message at the mouse's current coordinates.
        floatingMessage.style.left = e.pageX + 'px';
        floatingMessage.style.top = e.pageY + 'px';
        floatingMessage.innerHTML="<p class='label1'>Right click is disabled</p>";
        floatingMessage.style.display = 'block';
        setTimeout(function() {
            floatingMessage.style.display = 'none';
        }, 2000); // Hide after 2 seconds
    });*/


    $( "body" ).delegate("#customerTblID,#result-table1,#leadsPane,#estimatePane,#result-table","blur", function(e) {   // Capture Blur to do an auto save

        let saveRetValue=false;

        windowLog.trace("Inside "+this.id+" blur");

        if ($("#overLay li").length > 0 ) {
            windowLog.trace("Inside blur: overlay list is visible - empty the list");
            $("#overLay ul").empty(); 
        }
        localStorage.setItem("y9", $(window).scrollTop());
        localStorage.setItem("y9-lastActiveRow",e.target.closest("tr").rowIndex);
        if (this.id == "result-table")
            $("#result-table").removeClass("greyed-out");
        if ( $('#editCBID').is(":checked") ) {    // only save if the edit flag is on
            /*customerPanes.push("customers");
            if ( customerPanes.includes(this.id.replace("Pane","")) ) {// remove Pane
                $('#overLay ul li') = "";   // reset the overlay list
                saveRetValue=save(e.target,0);    // call save handler 
                switch ( this.id.replace("Pane","").toLowerCase() ) {

                    case "Leads"    :
                         $("#newLeadsBtn").addClass("button").prop("disabled",false);  // enable new button
                        break;

                    case "estimate"     :
                        break;
                    
                    case "customer"     :
                        break;

                    case "projects"     :
                        break;
                }
            } else {*/
                if ( ( e.target.nodeName != 'TD' ) && 
                     ( e.target != null ) && 
                     ( $('#overLay ul li').length == 0 ) ) {
                    editing=false;
                    if ( origText != e.target.value && 
                         charactersCount > 0 ) { // content changed
                        windowLog.trace("Inside blur-charCount:"+charactersCount+",origText:"+origText+" e.target:"+ e.target.value);
                        windowLog.trace("Inside blur-New content detected so save");
                        saveRetValue=save(e.target,1);    // call save handler with override set to true
                        if  ( e.relatedTarget != null ) {
                            if ( e.relatedTarget.nodeName != 'TD' ) 
                                origText=e.relatedTarget.value; // update the orig with the new content   
                        }
                        else
                            windowLog.trace("Inside blur: error- Invalid target");
                        /*if  ((_lastAction != 'tab' ) &&
                                ( $('#overLay ul li').length > 0) ) { // if in the middle of list, then reset and not save
                                windowLog.trace("Inside blur: reset list");
                                //$('#overLay').hide();
                        }*/
                    }
                    else {
                        windowLog.trace("Inside blur: no change detected or no char typed:"+charactersCount);
                        if ( ( charactersCount > 0) &&
                                ( e.relatedTarget != null ) ) {
                            if ( e.relatedTarget.nodeName != 'TD' )
                                origText=e.relatedTarget.value; // update the orign with the new content
                            else
                                windowLog.trace("Inside blur: error - invalid target");
                        }
                        else {
                            origText=e.target.value;
                            windowLog.trace("Inside blur: error - invalid target or charCount is 0:("+charactersCount+")");
                        }
                    }
                }
                else {
                    if ( _lastAction != 'tab'  &&  // blur due to mouse 
                         $('#overLay ul li').length > 0 )  { // if in the midle of lsit, then resset and not save
                            windowLog.trace("Inside blur-reset list");
                            $("#overLay ul").empty();
                    }
                    windowLog.trace("Inside blur: error- Conditions not met for save");
                }
                charactersCount=0;
            /*}
            customerPanes.pop();*/
        }
        else {
            //windowLog.trace("Edit is off - show enable edit dlg");
            //enableEditDlg();
        }
    });

    $( "body" ).delegate("#addrsSlctor","change",function() {
            
        if ($(this).is(':checked')) {
            windowLog.trace("Customer address checked");
            $(this).closest("div").find("#adrsLine1").val($("#customerTblID").find("#"+cstrIDtoProperty.AddrLine1).val());
            $(this).closest("div").find("#adrsLine2").val($("#customerTblID").find("#"+cstrIDtoProperty.AddrLine2).val());
            $(this).closest("div").find("#city-dropdown").val($("#customerTblID").find("#"+cstrIDtoProperty.city).val()).change();
            $(this).closest("div").find("#zip").val($("#customerTblID").find("#"+cstrIDtoProperty.zip).val());
            $(this).closest("div").find("#state").text($("#customerTblID").find("#"+cstrIDtoProperty.state).val());
        } else {
            $(this).closest("div").find("#adrsLine1").val("");
            $(this).closest("div").find("#adrsLine2").val("apt/floor");
            $(this).closest("div").find("#city-dropdown").val("San Diego");
            $(this).closest("div").find("#zip").val("");
            $(this).closest("div").find("#state").text("CA");

            windowLog.trace("Customer address unchecked");
        }
    });

    $("#result-table1").on("keydown","td input",function(event) {
   
        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
        windowLog.trace("Event listener-Inside keydown");
        const key=event.key;
        //if ( lastScreen != "Home" ) {
        for (const shortcut of shortcuts) {
            if (checkShortcut(event, shortcut)) {
                event.preventDefault();
                shortcut.action();
                console.log(`Shortcut triggered: ${shortcut.key}`);
                return;
            }
        }
        if ( $('#editCBID').is(":checked") || 
            ( allowedKeys.includes(key) ) ) {   // allow navigation keys even if edit mode is off
            /*if ( event.ctrlKey && key === 'z' ) {
                windowLog.trace("Event listener - calling CtrlZ");
                CtrlZ();
                windowLog.trace("Prevent default1");
                event.preventDefault(); // prevent any further TAB
            }*/
            //else {
               /* if ( event.ctrlKey && key === 'n' ) {
                    if ( $("#screen_name").html() === "Scheduler" ) {
                        windowLog.trace("Event listener - ctrlN");
                        CtrlN(event);
                        windowLog.trace("Prevent default2");
                        event.preventDefault(); // prevent any further TAB
                    }
                }*/
                //else {
                    let parentTableID="";
                    if ( typeof $(event.target).parents().filter("table")[0] != 'undefined' ) 
                        parentTableID=$(event.target).parents().filter("table")[0].id;
                    else
                        windowLog.trace("no table found:"+event.target.id);
                    if ( ( event.target.nodeName != "BODY" ) || ( parentTableID === "addSingleRec" ) )
                        resultKey=TblKeyDown(event);
                //}
            //}
        } 
        else {
            //if ( !(event.keyCode === 16) ) {   // shift Tab is 
                windowLog.trace("Ignore keydown..editMode is off");
                event.preventDefault(); // prevent edit 
                //$(this).addClass("greyed-out");
                enableEditDlg(this);
           // }
        }
    });

    function newEntry(element,header) { // handler when new entry selection is clicked

        var newRecPntr="newSingleRec";
        windowLog.trace("Inside newEntry handler");
        var retStatus=true;

        $("#overLay ul").empty();
        
        if ( lastFocusedEntry.length > 0 ) {
            newRecPntr=lastFocusedEntry[lastFocusedEntry.length-1].recPntr+"-"+lastFocusedEntry.length; // name the new rec pntr based on the previous record
            $('#newRecDiv-'+(lastFocusedEntry.length-1)).after('<div id="newRecDiv-'+(lastFocusedEntry.length)+'"><table hidden class="newRecDialg" id="'+newRecPntr+'"></div>');
        }
        else {
            newRecPntr="addSingleRec";
            $("#main-menue,#navID,#tHalf,customers,#innerCellID,#Pl,#caption,#result-table").addClass("greyed-out");
        }

        switch (header) {

            case "Project Number"  :
                addNewRec("Projects",element,newRecPntr);
            break;

            case "Employee Name"   :
                addNewRec("Employees",element,newRecPntr);
            break;

            case "Customer Name"   :
                addNewRec("Customers",element,newRecPntr);
            break;

             case "Company Name"   :
                addNewRec("Companies",element,newRecPntr);
            break;
            
            default                 :
                windowLog.trace("newEntry: No matching header found:"+$("#mainHeader tr th:eq("+element.index()+")").text());
                retStatus=false;
        }
        return retStatus;
    }