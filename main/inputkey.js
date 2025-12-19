    var currCell="";	                // holds the focused cell
    const paymentTypes=["Check","Credit Card","Wire Trasnfer"];
    const employmentType=["Full-Time","Part-Time"];
    var currentRecordPointer = 1;   // set initial value to out of range to be used as a "global" pointer
    var charactersCount = 0;        // Counter of the chrecters the user typed in the new record.
    var DelCounter = 0;             // a global flag to keep if delete is needed, only after save or any report length > 0;
    var _lastAction = "";
    var origText = "";              // keep the original field 
    var isTargetWindow = false;

    function CtrlZ() {
        windowLog.trace("CtrlZ dRow:"+deletedRow2.length);
        // allow to restore only if any rec was deleted, no other rec has been restored and the user is at the deleted screen    
        if ( (deletedRow2.length > 0) && 
             (!deleteOnce) && 
             (deletedRow2[deletedRow2.length-1][0].screenName == $("#screen_name").html()) ) { // only restore the last record
            //ctrlZ = true;   // flag to idicate to undo only if ctrlZ is true
            const rowNum=deletedRow2[deletedRow2.length-1][2].rowNumber
            //addNewRow("#result-table",lastScreen,rowNum,1); // restre the last deleted row
            ctrlZ = false;    // turn off the ctrlZ flag
            ///currCell = $('#result-table tbody tr td:nth-child(1)').first();
            
            setCellFocus();	// Set the focus at the first cell
            windowLog.trace("Restoring new row");
            deletedRow2=[];  // empty the deletedRow array so no more undo
            deleteOnce=true;
            const retCode=save($("#screen_name").html(),$('#result-table1 tbody tr:nth-child('+rowNum+')')[0],1);
        }
        else
            windowLog.trace("Nothing to restore or already restored or not in the proper screen-queue size="+deletedRow2.length+", deletedOnce:"+deleteOnce+", lastScreen:"+lastScreen);
    }

    function CtrlN(event) {
        windowLog.trace("CtrlN");
        addElement(event.target,-1,true);
    }

    function TblKeyDown(e) {
        
        var tableID='#'+$(e.target).parents('table').eq($(e.target).parents('table').length-1)[0].id;
        const isNewRec=e.target.closest('div').id.includes("newRecDiv");
        const digits="0123456789";
        var numOfColumns=0;//,element;
        const SpecialChars=["ArrowRight","ArrowLeft","ArrowDown","ArrowUp","Tab","Escape","Enter","Backspace","Shift"];
        const screenName=$("#screen_name").html();// document.getElementById("screen_name").innerHTML;
        const rows = $(tableID+' tbody tr').length; 
        var retValue=false; // used to indicate if the typed charecter will be shown or not
        var header="";
        var newArr =[];
        var key = e.key; 
        var showNewEntry=true;
        var regex=/[-a-zA-Z0-9 /!@#$%^&*()'_+={}Z\],<.>/?`~\\";:|]/g;
        let foundChar=regex.test(key);
        const specialChar = ( SpecialChars.indexOf(e.key) == -1 );

        windowLog.trace("TableKeyDown:("+e.currentTarget.id+") ..inside keydown,key="+e.key);
        _lastAction="";
        //=customerPanes.filter(u => tableID.toLowerCase().includes(u.toLowerCase())) // if the active table is in customers
        if ( (tableID == "#LeadsTableWrap") || (tableID == "#customerTblID") ) {  // special case when the input data is not tabular but a dialouge
            numOfColumns=$(e.target).closest("div").find("input").length;
            //element='td';
            const innText=$(tableID+" label[for='"+e.target.id+"']")[0].innerText;
            
            header=innText.slice(0,innText.indexOf(":"));
        } else {
            if (tableID !== "#innerCellID")
                numOfColumns=($("#"+e.currentTarget.id+" thead th").length)-1;//$('#mainHeader th').length-1;  // # of columns minus the delete column
        }

        if (e.ctrlKey && e.shiftKey && e.key === 'S') { 
            e.preventDefault();
            // Actions to perform when Ctrl+Shift+S is pressed
             windowLog.trace('Ctrl+Shift+S pressed');
            // Add your desired functionality here, such as saving the document
        }
        
        currCell=$(e.target).closest('td'); // Identify the TD
        active = 0;

        //id= prjShortCut // main project search
    
        switch ( screenName )  {
            case "Scheduler"    :  
                switch ( e.target.name ) {
                    
                    case 'projectNumber'    :
                        header = "projectScheduler" ; // Special case of the project number field in the Scheduler
                    break;

                    case 'schdPrjctDscrptn'    :
                        header = "schdPrjctDscrptns";
                    break;
                }
                break;

            case "Customers"    :  
                header=$("label[for='"+e.target.id+"']")[0].innerText.slice(0,$("label[for='"+e.target.id+"']")[0].innerText.indexOf(":"));
                //const tempHeaader=$(tableID+" label[for='"+e.target.id+"']")[0].innerText;
                break;

            default             :
                //if ( e.target.value.length == 1 ) // only add class in the first charecter, other wise not need to do this over again
                //    $("#main-menue,#tHalf,#Pls").addClass("greyed-out");
               
                switch ( e.target.id ) {
                    case "prjShortCut"      :
                        //$("#customersLbl,cstmrShortCut").addClass("greyed-out");

                    case "prjTreeID"        :
                        header="Project Number";
                        $("#overLay ul").attr('data-module',"Project Number");
                    break;

                    case "cstmrShortCut"    :
                        $("#projects").addClass("greyed-out");
                        header="CustomerFullRecord";
                    break;

                    default:
                        if (tableID != "#customerTblID") {
                            active=currCell.index()+1;    // calculate the cell numerical position from start
                            //header=$('#mainHeader'+' th:nth-child('+(currCell.index()+1)+')').html(); // Identify the header    
                            header=$("#"+e.currentTarget.id+" thead th:nth-child("+(currCell.index()+1)+")").html();
                        }
                        //else 
                            //header=$("label[for='"+e.target.id+"']")[0].innerText.replace(":",'');
                           
                }
            }
       
        if (e.key == 'z' && e.ctrlKey) {
           CtrlZ();
           windowLog.trace("key dowen- calling CtrlZ");
        }

        
        foundChar = foundChar && specialChar;

        //var selectionLength = 0;
        //if ( e.target.nodeName != "TD")
        //    selectionLength=e.target.selectionEnd-e.target.selectionStart-e.target.value.length;  // Calculate the selection text, if all the text and backspace, special case 
        if ( foundChar  || e.key === "Backspace" ) {   /*&&( selectionLength > 1)*/ 
        
            var tempArray=[];
            var isList=false;
            var saveRetValue=false;
            var text=e.target.value;
            windowLog.trace("Header:"+header);
            if ( e.key === "Backspace" )
                charactersCount > 0 ? charactersCount-- : charactersCount=0;
            else
                charactersCount++;
            switch ( header ) {

                case "First Name"          :
                case "Last Name"           :
                case "Address Line1"       :
                case "Address Line2"       :
                case "City"                :
                case "State"               :
                case "email"               :

                    isList=true;
                    
                break;

                case "Tel Number"       :
                    retValue=false;
                    if ( (( digits.indexOf(e.key) != -1 ) || ( e.key == "Backspace" ))) {   //only allow digits
                        retValue=true;
                        isList=charactersCount > 0?true: false;
                    }
                    else
                        windowLog.trace("Tel Number - Invalid character");
                break;

                case "CustomerFullRecord"       :
                    if ( classArray["Customers"].arr.length > 0 ) {
                        tempArray=classArray["Customers"].cNames;
                        isList=charactersCount > 0?true: false;
                    }
                    else 
                        windowLog.trace("Projects names array is empty!!");

                break;

                case "Company Name"        :
                    if ( lastScreen === "Companies" || // allow to add new company name in the company screen or from the shortcut 
                            lastFocusedEntry[lastFocusedEntry.length-1].module === "Companies" ) 
                        retValue=true;
                    else {
                        isList=charactersCount > 0?true: false;
                        if (Object.keys(classArray["Companies"].pNames).length > 0 ) {
                            Object.keys(classArray["Companies"].pNames).forEach( (name) => { //copy the return data from the DB into the class array
                                tempArray.push(name); })
                        }
                        else
                            windowLog.trace("Companies names array is empty");
                    }
                break;

                case "Vendor"               :
                    if ( Object.keys(classArray["Vendors"].pNames).length > 0 )  {
                        Object.keys(classArray["Vendors"].pNames).forEach( (name) => { //copy the return data from the DB into the class array
                            tempArray.push(name); })
                        isList=charactersCount > 0?true: false;
                    }
                    else
                        windowLog.trace("Vendors names array is empty");
                break;

                case "Contractor Name"      :
                    if ( screenName === "Contractors" ) 
                        retValue=true;
                    else {
                        if ( Object.keys(classArray["Contractors"].pNames).length > 0 ) {
                                Object.keys(classArray["Contractors"].pNames).forEach( (name) => { //copy the return data from the DB into the class array
                                tempArray.push(name); })
                            isList=charactersCount > 0?true: false;
                        }
                        else
                            windowLog.trace("Contractor names array is empty");
                    }
                break;

                case "Full Name"            :
                    if ( screenName === "Employees" ) 
                        retValue=true;
                    else {
                        if ( Object.keys(classArray["Employees"].pNames).length > 0 ) {
                                Object.keys(classArray["Employees"].pNames).forEach( (name) => { //copy the return data from the DB into the class array
                                tempArray.push(name);
                            });
                            isList=charactersCount > 0?true: false;
                        }
                        else 
                            windowLog.trace("Employee names array is empty!!");
                    }
                break;

                case "Payment Method"       :
                     showNewEntry=false; // do not allow new entry
                    if ( paymentTypes.length > 0 ) {
                        tempArray=paymentTypes;
                        isList=charactersCount > 0?true: false;
                    }
                    else
                        windowLog.trace("Payment names array is empty!!");
                break;

                case "Vendor Name"          :
                    retValue=true;
                    showNewEntry=false; // do not allow new entry
                break;

                case "Employment Type"      :
                    showNewEntry=false; // do not allow new entry
                    if ( employmentType.length > 0 ) {
                        tempArray=employmentType;
                        isList=charactersCount > 0?true: false;
                    }
                    else 
                        windowLog.trace("Employment typs array is empty!!");
                break;

                case "Project Number"       :  
                    if (Projects.pNames.length > 0) {
                        if ( (screenName !== "Projects") ||
                                ( e.target.id === "prjTreeID" ) )
                            /* || (e.target.id == "prjShortCutGallery") */  { // allow search in the project shortcut
                            tempArray=Projects.pNames;
                            isList=charactersCount > 0?true: false;
                        }
                    }
                    else 
                        windowLog.trace("Projects names array is empty!!");
                break;

                case "projectScheduler"     :   // In case of projctnumber filled in the Scheduler screen
                    // retValue=true; // allow editing only in the Project screen and the Scheduler
                    /*if ( e.target.name != "schdPrjctDscrptn" ) { */ // if the field name is not the description than its the project field 
                    if (Projects.pNames.length > 0) { // if not empty
                        tempArray=Projects.pNames;
                        isList=charactersCount > 0?true: false;
                        windowLog.trace("Inside keyDown, turninig on Editing");
                        $(e.target).closest('div').find('[id="editTaskID"]').show();
                    }
                    if ( e.target.closest('tr').id == "unAssignElementsTR" &&
                            e.target.value.length == 0 ) // if projectName is empty and the task is in the unAssigned then remove the assign
                            $(e.target).closest('td').find('[id="assignID"]').hide();
                  
                break;

                case "Zip"                  :
                    showNewEntry=false; // do not allow new entry
                    retValue=false;
                    if ( (( digits.indexOf(e.key) != -1 ) || ( e.key == "Backspace" )))    //only allow digits
                        retValue=true;
                    else
                        windowLog.trace("Zip - Invalid character");
                break;

                case "Payment Amount"       :
                case "Hourly Rate"          :
                case "Invoice Amount"       :
                case "Total Hours"          :
                case "estimateAmountID"     :
                    showNewEntry=false; // do not allow new entry
                    var isDigit=0;
                    if (digits.indexOf(e.key) !=-1) {
                        windowLog.trace("Digit found");
                        isDigit=1;
                    }
                        
                    retValue=true; // default
                    if (( isDigit ) || ( e.key == "-" ) || ( e.key == "." ) || ( e.key == "Backspace" )) { // Allow digits,backspoace and .
                        if ( (( e.target.value.indexOf(".") != -1 ) && ( e.key == "." ))  ||    // not allow more than one .
                            (( e.target.value.length == 0 ) && ( e.key == "." )) ||            // not allow . if string is empty
                            (( e.key == "-" ) && (header == "Invoice Amount") && (e.target.selectionStart == 0) && (e.target.value.indexOf("-") != -1)) || 
                            (( e.key == "-" ) && (header == "Invoice Amount") && (e.target.selectionStart > 0)) ||
                            (( e.key == "-" ) && (header == "Payment Amount") && (e.target.selectionStart == 0) && (e.target.value.indexOf("-") != -1)) || 
                            (( e.key == "-" ) && (header == "Payment Amount") && (e.target.selectionStart > 0)) ) // allow only single minus at 1st place
                        retValue=false;
                    }
                    else
                        retValue=false;
                break;
            
                /*case "Gas"                  :                : 
                    if ( (e.key == "0") || (e.key == "1")  || (e.key == "Backspace") ) // allowed only 0 or 1 or Backspace
                        retValue=true;
                break;*/
                case "schdPrjctDscrptns"     :
                    
                    if ( e.target.value.length )
                        $(e.target).closest('div[id="rootElement"]').find('[id="editTaskID"]').show();// show the edit button
                    else
                        $(e.target).closest('div[id="rootElement"]').find('[id="editTaskID"]').hide();// hide the edit button
                case "Notes"                :
                case "estimateTitleID"      :
                    showNewEntry=false; // do not allow new entry
                    retValue=true;
                break;


                default: // lije Notes just allowed 
                    windowLog.trace("Default field name:"+header);
                    retValue=true;
                    showNewEntry=false; // do not allow new entry
            }
            if ( isList ) { // is the header has a list?
                windowLog.trace("Inside isList");
                
                retValue = false;   // reset the retValue ahead of validating the charecter
                if ( tableID === "#innerCellID" ) {
                    $("#navID,#main-menue,#projectLbl,#customers,#tHalf").addClass("greyed-out");
                    $('img[id^="Pls"]').removeClass("greyed-out");
                    
                }
               
                if ( e.key == "Backspace" ) // in case of a backspace trim the last character 
                    text = text.substring(0, text.length - 1);
                else  
                    text += e.key;     // append the new charcter to the en

                $("#overLay ul").empty();
                if ( tableID === "#customerTblID" ) {

                    if ( header === "Notes" )    // all cases but notes, the search based of the search string
                        tempArray=classArray["Customers"].Notes;
                    else
                        tempArray=classArray["Customers"].cNames;
                    /*
                    const customerHeader = {
                        "First Name"       : () => {
                                tempArray=classArray["Customers"].firstNames;
                            },
                
                        "Last Name"       : () => {
                                tempArray=classArray["Customers"].lastNames;                                         
                            }
                    };
                    customerHeader[header]();*/
                    let searchStr="";
                    if (text.indexOf(" ") >= 0)
                        searchStr=text.substring(0,text.indexOf(" "));// first narrow based on the first string
                    else
                        searchStr=text;
                    if ( text.length > 0 ) {
                        var tempArr=tempArray.map(function(element,index) {
                            if (element.toLowerCase().includes(searchStr.toLowerCase()))
                                return classArray["Customers"].cNames[index];
                                //return index; //classArray["Customers"].arr[index].customer_id;
                            else
                                return -1;
                        });
                        newArr=tempArr.filter(index => index !== -1);
                    }
                    else
                        newArr = [];
                }
                else {
                    let searchStr;
                    if (text.indexOf(" ") !== -1)
                        searchStr=text.substring(0,text.indexOf(" "));// 
                    else 
                        searchStr=text;
                    newArr = tempArray.map((element, index) => element.toLowerCase().includes(searchStr.toLowerCase())?element:-1).filter(index => index !== -1);
                }
                var outList="";
                if ( newArr.length > 0 ) {
                    if (e,key.length === 1) { // only disable once,. the first time
                        $("#"+e.currentTarget.id).addClass("greyed-out");
                        $("#"+e.currentTarget.id).css("opacity",'0.8');
                    }
                
                    searchStr=text.split(" ");
                    searchStrLegth=text.split(" ").length;
                    if (text.indexOf(" ") === text.length-1) {// if the last char is " " than ignore
                        searchStr.pop();
                        searchStrLegth--;
                    } 
                    for (let i=1; i < searchStrLegth ;i++)  // loop throu all the strings between the spaces to narow down the search results
                        newArr = newArr.map((element, index) => element.toLowerCase().includes(searchStr[i].toLowerCase())?element:-1).filter(index => index !== -1);
                    retValue = true;    // flag to show the charecter
                    /*if (!editing) { // Is this the first time then show the list  
                        editing = true;
                        // show the list right below the input field
                        //if ( e.target.id != "prjTreeID" ) {
                            
                        $("#overLay").css({ position: "absolute",
                                            top     : e.target.getBoundingClientRect().bottom+"px",
                                            left    : e.target.getBoundingClientRect().left+"px"});
                        windowLog.trace("Top:"+e.target.getBoundingClientRect().bottom+" left:"+e.target.getBoundingClientRect().left);
                       
                    }*/
                    const listLength=newArr.length>20?20:newArr.length; // dispaly only the top 10
                    
                    for (let i = 0; i < listLength; i++) {
                        if ( tableID != "#customerTblID" ) {
                            if (( e.target.id != "prjTreeID" ) || 
                                ( ( e.target.id == "prjTreeID" ) && 
                                  ( $("#jName").html() != newArr[i] )))  // do not include the same project number in the list
                                                                            // to void copy/move to the same project
                                outList += `<li tabindex="0" id="focusableElement-${newArr[i]}">${newArr[i]}</li>`;
                        }
                        else 
                            //         outList += `<li tabindex="-1" id="focusableElement-`+classArray["Customers"].arr[Number(newArr[i])].customer_id+`"`+">"+classArray["Customers"].arr[Number(newArr[i])].customer_first_name+`</li>`;
                        //    outList +=`<li tabindex="-1" id="focusableElement-`+classArray["Customers"].arr[Number(newArr[i])].customer_id+`"`+">"+classArray["Customers"].cNames[Number(newArr[i])]+`</li>`;                      
                            outList +=`<li tabindex="0" id="focusableElement-`+classArray["Customers"].cNames.findIndex(x => x === newArr[i])+`"`+">"+newArr[i]+`</li>`;                      
                    }
                    
                    /*switch ( header ) {

                        case "Project Number" : 
                            outList += `<li tabindex="0" id="new entry">New Entry</li>`;
                        break;

                    }*/

                    if ( e.target.id == "prjShortCutGallery") 
                        $("#MoveBtn").prop("disabled",false); // enable the move button
    
                } else {
                    if ( lastScreen === "Customers"  ||  
                        e.target.id === "cstmrShortCut" ) {
                        //e.target.value += e.key;
                        origText="";
                        retValue=true;  // allow the text to show
                    }
                    else {
                        e.target.value="";
                        $("#"+e.currentTarget.id).removeClass("greyed-out");
                        editing=false;
                        //$('#uListID').html("");
                        //$("#overLay ul").empty();
                        //$("#overLay").hide();
                        //$(e.target).focus();
                        //windowLog.trace("Prevent default3");
                        //$("#btnYes").hide();
                        //e.preventDefault();
                    }
                }
                if ( outList.length || 
                     showNewEntry) {

                    if ( showNewEntry )    // sopme fields do not allow new entry like payment method
                        outList += `<li tabindex="0" id="new entry">New Entry</li>`;
                    if ( !editing ) { // Is this the first time then show the list  
                        editing = true;
                        $("#overLay").css({ position: "absolute",
                                            top     : e.target.getBoundingClientRect().bottom+"px",
                                            left    : e.target.getBoundingClientRect().left+"px"});
                        windowLog.trace("Top:"+e.target.getBoundingClientRect().bottom+" left:"+e.target.getBoundingClientRect().left);
                       
                    }

                    $("#overLay ul").append(outList);
                    $('#overLay').show();
                }
            }
        } 
        else {
            if ( e.shiftKey && e.key === 'Tab' ) {
                windowLog.trace("Shift Tab");
                retValue=true;
                $("#overLay ul").empty();
                //$('#overLay').hide();
                if ( lastScreen  !== "Scheduler" ) {
                    let leftMostTD = 1; // not allowed to go left beyond the 1st TD
                    if (lastScreen == "Projects")
                        leftMostTD = 2; // not allowed to go left beyond the 2nd TD  
                    // if lower left most TD - do nothing
                    if ( e.target.closest('td') != $(tableID+' tbody tr:first td:nth-child('+leftMostTD+')')[0] ) { 
                        // if not left most cell in the TR
                        if ( (e.target.closest('td')) == $(e.target).closest('tr').find('td:nth-child('+leftMostTD+')')[0] )
                            currCell=currCell.closest('tr').prev().find('td:nth-child(' + (numOfColumns)+ ')'); // focus on the right most cell at the previous row
                        else 
                            currCell=currCell.prev();
                        active--;  
                        currCell.children().first().focus();	// focus on the first input!!
                    }
                    windowLog.trace("Prevent default5");
                    e.preventDefault(); // prevent any further ShiftTAB
                    windowLog.trace("New header:"+$("#"+e.currentTarget.id+" thead th:nth-child("+currCell.index()+")").html());
                    origText=$(currCell).children().first().val();
                }
            }
            else {
                switch (e.key) {
                    case "Backspace"    :
                        retValue = true;
                        //if (charactersCount == 0)
                        //    origText = e.target.value ; // save the origText only at the first keystroke
                        
                        if ( ( e.target.value.length == 1 ) )  {    // 1 means single chars left and with backspace it will delete /*( e.target.value.length == 0 ) ||*/
                                /*if ( e.target.value.length == 1 )*/  // 1 means this is the last charachter so the backspace will remove it
                            editing = false;
                            charactersCount=0;
                            $("#overLay ul").empty();
                            //$('#overLay').hide();
                            $("#btnYes").hide();    // hide the button from the tree screen                                    
                        }
                    break;

                    case "Tab"          : 
                        windowLog.trace("Inside Tab- charCount:"+charactersCount);
                        retValue=true;
                        _lastAction="tab";
                        if ($('#overLay ul li').length > 0) { // search box has more than one entry than switch to the search box to allow moving up and down
                            if ($('#overLay ul li').length > 1) {
                                $('#overLay ul li').first().focus(); // focus to the first element in the list
                                //document.getElementById($('#overLay ul li')[0].id).focus();
                                //$("#"+$('#overLay ul li')[0].id).focus();
                                //$('#overLay ul li')[0].classList.add("selectedLI");
                                e.target.value=$('#overLay ul li')[0].innerText; // set the input box to the first element in the list
                                //lastSelctedListItem = $('#overLay ul li')[0]; // set the last selected item to the input box
                                                                
                                currCell=$(e.target).closest('td');//e.target.closerst('td');  // set the currCell to the input
                                //e.target=$('#overLay ul li').first()[0]; // set the target to the first element in the list
                            }
                            else { // only one entry left in the list than act as enter
                                if ( lastScreen == "Customers" ) {
                                    const cstmNumber=classArray["Customers"].cNames.findIndex(x => x === $('#overLay ul li').first().text());
                                    updateCustomerPane(Number(classArray["Customers"].arr[cstmNumber].customer_id));
                                } else {
                                    if ( $('#overLay ul li').first().text() === "New Entry" ) {
                                        e.target.value=""; // clear the field for new entry
                                        newEntry($(currCell).closest('td'),currCell.closest("table").find('[id="mainHeader"]').find(" tr th:eq("+currCell.index()+")").text()); 
                                    } else {
                                        e.target.value=$('#overLay ul li').first().text();
                                        if ( e.target.name == "projectNumber" &&
                                            lastScreen == "Scheduler" &&
                                            e.target.closest('tr').id === "unAssignElementsTR" &&
                                            $(e.target).closest('td').find('[id^="activeEmplListID"]').val() !== "" &&
                                            $(e.target).closest('td').find('[id^="unAssgnTskDateID"]').val() !== "") { // if the field name is not the description than its the project field
                                            windowLog.trace("Enable assign");
                                            $(e.target).closest('td').find('[id="assignID"]').show();
                                        }
                                    }
                                }
                                $("#overLay ul").empty(); //$('.uList').text("");
                                editing=false;
                            }
                            windowLog.trace("Prevent default6");
                            e.preventDefault(); // prevent any further TAB
                        } 
                        else {
                            if (tableID != "#customerTblID") {    
                                currCell.children().first().css({'background-color'    : '#F7F7FC'}); // remove the highlight from the current cell              
                                if ( ( e.target.type != 'date' ) && 
                                        ( e.target.type !== 'time' ) &&
                                        ( screenName    !== "Scheduler") ) {
                                        if (e.target.closest('td') !== $(tableID+' tbody tr:last td:last')[0]) { // is this the last TD in the table
                                            if ( ( e.target.closest('td').cellIndex < numOfColumns ) ) {   // Not end of the row
                                            
                                                currCell = currCell.next();              // Move one cell to the right
                                                active++;
                                            }
                                            else {
                                                let leftMostTD = 1; // focus on the 1st TD
                                                if (lastScreen == "Projects")
                                                    leftMostTD = 2; // focus on the 2nd TD(skip the projct number)
                                            
                                                currCell = currCell.closest('tr').next().find('td:nth-child('+leftMostTD+')');    // point to the next cell in the next TR
                                                active += 2;   // Position the active to the first new cell at the new row
                                            }
                                        } 
                                        else { // reached the end of the table 
                                            windowLog.trace("End of table");
                                            //let firstElement = 1;
                                            if ( lastScreen !== "Projects" && 
                                                tableID != "#addSingleRec" ) {
                                                addNewRow(tableID,$("#screen_name").html(),rows,0);
                                                active += 2;  // poition the active on the first ld next to project name
                                                currCell = currCell.closest('tr').next().find('td:nth-child(1)'); // move to the 1st cell in the next row
                                            }
                                            else {                                               
                                                active = 2;
                                                //currCell = currCell.closest('tr').find('td:nth-child(2)'); // move to the 1st cell in the next row
                                            }
                                        }
                                    }
                                    currCell.children().first().css({'background-color'    : '#aadef0ff'}); // remove the highlight from the current cell            
                                   // currCell.children().first().focus();	// focus on the first input!!
                            } else {
                                // check if any field is empty
                                // save the new customers to the db
                                retValue = true;
                            }
                            if ( charactersCount > 0 &&
                                origText != e.target.value &&
                                !isNewRec ) 
                                saveRetValue=save(e.target,1);    // call save handler with override set to true
                        }
                    break;

                    case "Enter"        :
                        if ( $('#overLay ul li').length > 0 ) {
                            if ( $('#overLay ul li').length == 1 ) {
                                if ( lastScreen == "Customers" ) {
                                    const cstmNumber=classArray["Customers"].cNames.findIndex(x => x === $('#overLay ul li').first().text());
                                    updateCustomerPane(Number(classArray["Customers"].arr[cstmNumber].customer_id));
                                } else {
                                    if ( $('#overLay ul li').first().text() === "New Entry" ) {
                                        e.target.value=""; // clear the field for new entry
                                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").hide();
                                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").hide();
                                        newEntry($(currCell).closest('td'),currCell.closest("table").find('[id="mainHeader"]').find(" tr th:eq("+currCell.index()+")").text()); 
                                    } else
                                        e.target.value=$('#overLay ul li')[0].innerText; // only one entry than act as enter
                                }
                                $("#overLay ul").empty();
                                editing=false;
                                charactersCount=0;
                                //Tasks.newTask= e.target;    // Save a pointer to the field for coloring and send to the DB
                            }
                        }
                        else {
                            if ( tableID == "#customerTblID" )
                                updateCustomerPane($("#customer_id").text());
                            else {
                                windowLog.trace("Header"+header);
                                switch (header) {

                                    case "CustomerFullRecord"    :
                                        if (e.target.value != "") // not empty customer name then open the cusotmer form a
                                                                    //  and populate the fields with the corresponding record
                                            showCustomer(classArray["Customers"].cNames.findIndex(t => t == e.target.value),e.target.id);
                                    break;    

                                    case 'Project Address'      :
                                        if (e.target.value != "") // not empty address then open google maps with the address
                                            window.open("http://maps.google.com/?q="+e.target.value,"_blank");
                                    break;

                                    case 'Project Number'       :
                                        if ( e.target.id != "prjTreeID" ) {
                                            if ( ( screenName === 'Projects' ) ||
                                                    ( screenName === "Home" ) ) { // open projectdetails if in the Project screen
                                                //var entryNumber=-1;
                                                // search for the project number just to be safe
                                                //const entryNumber=Projects.retEntrybyID(e.target.value.split("-")[0]); 
                                                const prjNumber=e.target.value.split("-")[0];
                                                //const entryNumber=Projects.retEntrybyID(prjNumber); 

                                                const entryNumber=Projects.arrProjects.findIndex(t => t.project_number == prjNumber);
                                                if (entryNumber != -1) 
                                                    showProjectSummary(e.target.closest('tr').rowIndex,entryNumber);
                                            }
                                        }
                                        else {
                                            if ($("#prjTreeID").val() != "" )   { // just a precaution 
                                                windowLog.trace("Enter and prjID");
                                                //var htmlText = "<br><center>Are you sure?<br><br><input type='button' class='button' value='Yes' id='btnYes'/>&nbsp<input 
                                                // type='button' class='button' value='No' id='btnNo' /></center>";
                                                //$("#buttomHalfID").html(htmlText);
                                                $("#btnYes").val($('input[name=opRadio]:checked').val());
                                                $("#btnYes").show();                                                
                                                $('#btnYes').unbind("click");
                                                $('#btnYes').click({destTree        : $('#aboutDialog').attr('name'), // get the active tree
                                                                    dstnFolder      : $("#prjTreeID").val()+"/"+e.data.parentFolder,
                                                                    srcFolder       : e.data.srcPath,
                                                                    filename        : e.data.srcFilename,
                                                                    parentFolder    : e.data.parentFolder},fileOpsGo);
                                                $('#btnNo').click(cleanupTree);
                                            }
                                        }

                                    break;

                                    case "Hourly Rate"          :
                                        showHR($(e.target).closest('tr').find('#employeeId').val()); // Call showHR with the employeeID
                                    break;

                                    case "Notes"                :
                                        // increase the number of lines
                                        const numRows=$(e.target).attr("rows");
                                        if ( Number(numRows) < 4 ) {
                                            $(e.target).attr("rows",Number(numRows)+1);
                                            retValue = false;
                                        }
                                        retValue=true;
                                    break;

                                    case "Files"            :
                                        showFileUpload(e.target,"generalUpload","fileUploadControl",lastScreen);
                                        break;

                                    case "Installer"       :
                                        break;

                                    /*case "projectScheduler" :
                                    case "Vendor"           :
                                    case "Payment Method"   :
                                    case "Full Name"        : 
                                        if ( $('#overLay ul li').length == 1 ) {
                                            alert ("Please research");
                                            currCell=e.target;
                                            charactersCount++;  // add the reminder text char count 
                                            currCell.value=$('#overLay ul li').text(); // Update the Project Name with the Project name that was selected by the user
                                            document.getElementById("overLay").hidden=true;	//hide the overLay          
                                            document.querySelector(".uList").innerHTML = "";
                                            currCell.focus();   // return focus to the launching cell
                                            editing=false;      // no more editing
                                        }
                                    break;*/
                                }
                            }
                        }
                    break;

                    case "Escape"                               : // esc - just restore the original value
                        
                        //$("#main-menue,#navID,#tHalf,#projects,#Pls,#customers").removeClass("greyed-out");
                        if ( charactersCount ) {
                            if (lastScreen != "Scheduler") { // return the focus to the cell
                                if ( e.target.id != "prjShortCutGallery" )  // special case of project input field 
                                    currCell=$(currCell).closest('td'); // Identify the TD
                                else
                                    $("#MoveBtn").prop("disabled",false);
                            } else {
                                if ( origText === "" ) { // if the original text is empty hide the assign button
                                    if ( $(e.target).closest('div').find('[name="projectNumber"]').val() === "" ) // if the project is also empty then hide the edit
                                        $(e.target).closest('div').find('[id="editTaskID"]').hide();
                                    else
                                        $(e.target).closest('div').find('[id="editTaskID"]').show();
                                }
                            }

                            if ( e.target.value !== origText ) {
                                    e.target.value = origText;
                                windowLog.trace("Content change detected- restore origin");
                            }
                            else
                                windowLog.trace("No content change detected- do nothing");
                            e.target.focus();
                            if ( (!e.target.id.toLowerCase().includes("date")) && 
                                    (!e.target.id.toLowerCase().includes("time")) )
                                e.target.setSelectionRange(0,0);
                            charactersCount=0;
                        }
                        else
                            windowLog.trace("No content change detected- do nothing");
                        retValue = false;
                        editing = false;
                        if ($('#overLay ul li').length > 0) 
                            $("#overLay ul").empty(); //$('.uList').text("");
                        $("#"+e.currentTarget.id).removeClass("greyed-out");
                        $("#"+e.currentTarget.id).css("opacity",'1.0');
                        if ( lastFocusedEntry.length === 0) {
                            $("#navID,#main-menue,#customers,#projectLbl,#tHalf,#innerCellID,#Pl,#caption,#result-table").removeClass("greyed-out");
                            $('img[id^="Pls"]').removeClass("greyed-out");
                            lastFocusedEntry=[]; // remove the last focused entry from the stack 
                        }
                        /*if ( e.currentTarget.id === "addSingleRec" )
                            $("#addSingleRec").removeClass("greyed-out");
                        else
                            if ( e.target.id == "prjTreeID" )
                                $("#jstree").removeClass("greyed-out");*/
                    break
                
                    case "ArrowLeft"                            : 
                        editing=false;
                        if ($('#overLay ul li').length > 0) { // if list box is "open" then reset the values, hide and clea nthe 
                            //e.target.value="";
                            //$("#overLay ul").empty(); //$('.uList').text("")
                            //$('#overLay').hide();
                            //ret_value=false;
                        }  else {
                                if (header != "projectScheduler") { 
                                    if (e.target.selectionStart == 0) {
                                        currCell.children().first().css({'background-color'    : '#F7F7FC'}); // remove the highlight from the current cell  
                                        if (( e.target.type != 'date' ) && ( e.target.type != 'time' )) {
                                            let leftMostTD = 1; // point to the 1st TD in the TR
                                            if (lastScreen == "Projects")
                                                leftMostTD = 2; // wrap around to the 2nd TD - skip the project number  
                                            if ( e.target.closest('td')  != $(tableID+' tbody tr:first td:nth-child('+leftMostTD+')')[0] ) { 
                                                if ( (e.target.closest('td')) == $(e.target).closest('tr').find('td:nth-child('+leftMostTD+')')[0] ) { 
                                                    currCell=currCell.closest('tr').prev().find('td:nth-child(' + (numOfColumns)+ ')'); // focus on the right most cell at the previous row
                                                    active-=numOfColumns;
                                                }
                                                else {
                                                    currCell=currCell.prev();
                                                    active--;
                                                }
                                                currCell.children().first().css({'background-color'    : '#aadef0ff'}); // remove the highlight from the current cell      
                                                setCellFocus();  
                                            }
                                            else { // wrap around .. move to the last cell
                                                currCell=currCell.closest('tr').find('td:last'); // skip project number 
                                                active -= numOfColumns+1;
                                            }
                                            currCell.children().first().focus();	// focus on the first input!!
                                        }
                                    }
                                    else
                                        retValue=true;
                                }
                                else
                                    retValue=true;  
                            }
                    break;

                    case "ArrowRight"                               :           
                        editing=false
                        retValue=true;
                        if ($('#overLay ul li').length > 0) { // search box has more than one entry than switch to the search box to allow moving up and down
                            if ($('#overLay ul li').length > 1) {
                                $('#overLay ul li')[0].classList.add("selectedLI"); 
                                $('#overLay ul li')[0].focus(); // "focusableElement-1"
                                currCell=e.target;
                            }
                            else { // only one entry than act as enter
                                e.target.value=$('#overLay ul li')[0].innerText;
                                $("#overLay ul").empty();
                                //$('#overLay').hide();      
                                document.querySelector(".uList").innerHTML = ""; // reset the list
                            }
                            retValue=false;
                        } 
                        else {
                            if ( e.target.value.length == e.target.selectionStart ) { // only move one cell right if the cursor at the end of the field
                                if (( e.target.type != 'date' ) && 
                                    ( e.target.type != 'time' )) {
                                    currCell.children().first().css({'background-color'    : '#F7F7FC'}); // remove the highlight from the current cell
                                    if (e.target.closest('td') != $(tableID+' tbody tr:last td:last-child')[0]) {
                                        if ( (currCell.index() < numOfColumns) )    // Not end of the row    
                                            currCell = currCell.next();             // Move one cell to the right
                                        else {
                                            let leftMostTD = 1; // point to the 1st TD in the next row
                                            if (lastScreen == "Projects")
                                                leftMostTD = 2; // point to the 2nd TD in the next row (skipping the project number)  
                                            currCell=currCell.closest('tr').next().find('td:nth-child('+leftMostTD+')'); 
                                        }
                                    }
                                    else { // end of table
                                        windowLog.trace("End of Table");
                                        if (lastScreen != "Projects") { // Add a new row only if not the Project table
                                            //newRecord=true;
                                            //lastID[lastScreen]++;   // only here increament the ID by 1
                                            addNewRow(tableID,$("#screen_name").html(),rows,0); 
                                            currCell=currCell.closest('tr').next().find('td:nth-child(1)');
                                        }
                                        else
                                            currCell=currCell.closest('tr').find('td:nth-child(2)'); // swrap around , kip project number
                                    }
                                    currCell.children().first().css({'background-color'    : '#aadef0ff'}); // highlight the new current cell
                                    active=Number($(currCell).attr("tabindex"));    // calculate the cell numerical position from start
                                    setCellFocus();
                                }
                                else
                                    retValue=true;
                            }
                            else    
                                retValue=true;
                        }
                    break;

                    case "ArrowUp"                                      :

                        editing=false;
                        if ( $('#overLay ul li').length > 0 ) { // if list box is "open" then reset the values, hide and clea nthe 
                            e.target.value="";
                            ret_value=false;
                                $("#overLay ul").empty();
                        }
                        else {
                            if ( lastScreen == "Customers") {
                                /*if ( ( e.target.id == "customerFirstName") || 
                                        ( e.target.id == "customerLastName") ) {
                                        let cstmrId=Number($("#customer_id").text()); 
                                        if ( cstmrId == 1) 
                                            cstmrId = lastID["Customers"];
                                        else
                                            cstmrId--;
                                    updateCustomerPane(cstmrId);
                                    $("#updateRecordBtn").show(); // show the update record button
                                }*/
                            } else {
                                if (( e.target.type != 'date' ) && ( e.target.type != 'time' )) {
                                    currCell.children().first().css({'background-color'    : '#F7F7FC'}); // remove the highlight from the current cell      
                                    if ( e.target.closest('tr').rowIndex  > 1) {  // only move up if this is not the first row
                                        currCell = currCell.closest('tr').prev().find('td:nth-child('+currCell.index()+')');   
                                        active -= numOfColumns;
                                        e.target.setSelectionRange(0,0);
                                        setCellFocus();
                                    }
                                } else
                                    retValue=true;
                            }
                        }
                        
                        currCell.children().first().css({'background-color'    : '#aadef0ff'}); // highlight the new current cell
                        //$('#overLay').hide();
                    break;

                    case "ArrowDown"                                           :

                        editing=false;
                        if ($('#overLay ul li').length > 0) { // if list box is "open" then reset the values, hide and clean the list 
                            //e.target.value="";
                            $('#overLay ul li').first().focus(); // focus to the first element in the list
                                //document.getElementById($('#overLay ul li')[0].id).focus();
                                //$("#"+$('#overLay ul li')[0].id).focus();
                            //$('#overLay ul li')[0].classList.add("selectedLI"); 
                            retValue=false;
                        }
                        else {
                            if ( lastScreen == "Customers") {
                                /*if ( ( e.target.id == "customerFirstName") || 
                                        ( e.target.id == "customerLastName") ) {
                                        let cstmrId=Number($("#customer_id").text()); 
                                        if ( cstmrId == lastID["Customers"]) // reached the ebnd
                                            cstmrId = 1; // back to 1
                                        else
                                            cstmrId++;  // otherwise increment
                                    updateCustomerPane(cstmrId);
                                    $("#updateRecordBtn").show(); // show the update record button
                                }*/
                            } else {
                                if (( tableID != "#addSingleRec" ) &&
                                    ( e.target.type != 'date' )    && 
                                    ( e.target.type != 'time' )) {
                                    if ( ( e.target.closest('tr').rowIndex == $(tableID).find("tr").last().index()+1) && 
                                            ( lastScreen != "Projects" ) ) {  // Add new row only if the last row and not in Projects screen
                                        //lastID[$("#screen_name").html()]++;   // only here increament the ID by 1
                                        addNewRow(tableID,screenName,rows,0); 
                                    }
                                    currCell.children().first().css({'background-color'    : '#F7F7FC'}); // remove the highlight from the current cell                        
                                    //currCell=currCell.closest('tr').next().find('td:nth-child('+currCell.index()+')'); // the TD at the next row straight below
                                    currCell=currCell.closest('tr').next().find('td:nth-child('+$(e.target).closest('td').index()+')'); // the TD at the next row straight below
                                    currCell.children().first().css({'background-color'    : '#aadef0ff'}); // highlight the new current cell
                                    active+=numOfColumns;  
                                    e.target.setSelectionRange(0,0);
                                    setCellFocus();
                                    //currCell.children().first()[0].setSelectionRange(0,0);
                                }
                                retValue=true;
                            }
                        }
                        //$("#overLay ul").empty();//$('.uList').text("")
                        //$('#overLay').hide();
                    break;    
                }
            }
        }
            
       /*if ( tableID == "#addSingleRec" ) { // only in Single record screen
            if ( charactersCount > 0 ) {
                if ( ( ( lastScreen == "Employee Jobs" ) && 
                       ( document.getElementsByName("projectName")[0].value != "" ) ) ||
                     ( lastScreen != "Employee Jobs" ) ) 
                     //if (e.target.closest('tr').id == "Scheduler" ) {
                        //const currentTR=$(e.target).closest("tr");
                        //if ( validateEnableSaveConditions(lastScreen,currentTR) )
                        /*if (( (currentTR.find('[id="prjctNumberID"]').val() != "" ||
                               currentTR.find('[id="schdlrDcrptnID"]').val() != "") &&
                               currentTR.find('[id="unAssgnTskDateID"]').val() != "" &&
                               currentTR.find('[id="activeEmplListID"]').val() != "unassigned" ) ||
                            (  currentTR.find('[id="activeEmplListID"]').val() == "unassigned" &&
                               (currentTR.find('[id="prjctNumberID"]').val() != "" ||
                                currentTR.find('[id="schdlrDcrptnID"]').val() != "") ) ) 
                        //    $("#SaveNewBtn,#SaveCloseBtn").show();
                        //else
                        //    $("#SaveNewBtn,#SaveCloseBtn").hide();
                    //} else 
                    //    $("#SaveNewBtn,#SaveCloseBtn").show();
            }
            else 
                $("#SaveNewBtn,#SaveCloseBtn").hide();
        } */
        /*if ( !retValue ) { // dont show the char if not suppose to
            //if (tableID != "#customerTblID") {
                //windowLog.trace("Prevent default12");
                e.preventDefault();
            //}
        }
        else {*/
            if ( e.key === "Backspace" ) {
                charactersCount = charactersCount > 0 ? charactersCount-- : 0; // decrease the characters count
                if ( charactersCount === 0 ) {
                    if ( $("#overLay ul").length )
                        $("#overLay ul").empty();
                    if ( lastFocusedEntry.length === 0 ) {
                        $("#navID,#main-menue,#customers,#tHalf,#projectLbl,#innerCellID,#Pl,#caption,#result-table").removeClass("greyed-out");
                        $('img[id^="Pls"]').removeClass("greyed-out");
                        lastFocusedEntry=[]; // remove the last focused entry from the stack
                    } else {
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").hide();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").hide();
                    }
                }
                else 
                    if ( charactersCount > 0 && 
                         lastFocusedEntry.length > 0 && 
                         validateEnableSaveConditions(lastFocusedEntry.length>0?lastFocusedEntry[lastFocusedEntry.length-1].module:lastScreen,
                            lastFocusedEntry.length>0?l$("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tr:eq(1)"):$(lastScreen).closest('tr')) ) {
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").show();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").show();
                }
            }
            else 
                if ( e.key != 'Tab' && e.key != 'Shift' ) {
                    if ( isNewRec && 
                         validateEnableSaveConditions(lastFocusedEntry.length>0?lastFocusedEntry[lastFocusedEntry.length-1].module:lastScreen,
                            lastFocusedEntry.length>0?$("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tr:eq(1)"):$(lastScreen).closest('tr'))) {
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").show();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").show();
                    }
            }
        //}
        windowLog.trace("keydown, ret_value:"+retValue+" charCount="+charactersCount
            
        );
        return retValue;
    }

    function overLayKeyDown(event) {

        var newIx;
        var retValue=true;

        windowLog.trace("Inside overLay keydown-"+event.key);
        windowLog.trace("currentRecordPointer: "+currentRecordPointer);
        
        switch ( event.key ) {

            case "Tab"  :

                retValue=false;
                $("#overLay ul").empty();
                $("#navID,#main-menue,#customers,#tHalf").removeClass("greyed-out");
                $('img[id^="Pls"]').removeClass("greyed-out");
                currentRecordPointer=0;
                event.target.innerText=""; // reset the value
            break;

            case "Enter":	
                var lastCell;
                retValue=false;
                charactersCount += currCell.find("input").first().val().length; // update the characters count
                 $("#overLay ul").empty();
                if ( event.target.innerText !== "New Entry" ) {
                    if ( lastFocusedEntry.length === 0 ) { // overlay in prohjects or customers screen
                        $("#navID,#main-menue,#customers,#tHalf,#projectLbl,#innerCellID,#Pl,#caption,#result-table").removeClass("greyed-out");
                        lastCell=currCell;
                    }
                    else { // overlay in Scheduler screen
                        lastCell=lastFocusedEntry[lastFocusedEntry.length-1].currCell;
                        currentRecordPointer=0;
                    }
                    if ( lastScreen === "Customers" ) {  // special case 
                        let cstmr_id;
                        let entry;
                        if ( entry=classArray["Customers"].cNames.findIndex(x => x === event.target.id.split("-")[1]) != -1 ) {
                            const customer_id=Number(classArray["Customers"].arr[entry].customer_id);
                            updateCustomerPane(Number(cstmr_id));
                        }
                    }
                    
                    if ( lastScreen === "Scheduler" &&
                         currCell.closest('tr').id === "unAssignElementsTR" &&
                         $(currCell).closest('td').find('[id^="activeEmplListID"]').val() != "" &&
                         $(currCell).closest('td').find('[id^="unAssgnTskDateID"]').val() != "" ) { // if the field name is not the description than its the project field
                         $(currCell).closest('td').find('[id="assignID"]').show();
                    }
                    //let tableID=event.currentTarget.closest("table").id;
                    if ( event.data.invoker === "tree" ) {
                        //var htmlText = "<br><center>Are you sure?<br><br><input type='button' class='button' value='Yes' id='btnYes'/>&nbsp<input type='button' class='button' value='No' id='btnNo' /></center>";
                        //$("#buttomHalfID").html(htmlText);
                        $("#btnYes").val($('input[name=opRadio]:checked').val());
                        $("#btnYes").show();
                        $('#btnYes').unbind("click");
                        $('#btnYes').click({destTree        :   $('#aboutDialog').attr('name'), // get the active tree
                                            dstnFolder      :   $("#prjTreeID").val()+"/"+event.data.parentFolder,
                                            srcFolder       :   event.data.srcPath,
                                            filename        :   event.data.srcFilename,
                                            parentFolder    :   event.data.parentFolder},fileOpsGo);
                        $('#btnNo').click(cleanupTree);
                    
                    } else {
                        currCell.find("input").focus();//$(lastCell).children().first().focus();// focus on the first input!!; // return focus to the launching cell
                        editing=false; // no more editing
                        //currCell=currCell.parentNode; // point currCell to the TD
                    }
                    //charactersCount++; // update the charCounter to trigger saving
                    if ( ( charactersCount > 0 ) && 
                         ( lastCell.closest('div').attr('id').includes("newRecDiv") ) ) {
                            if ( validateEnableSaveConditions(lastScreen,$(lastCell).closest('tr')) )
                                $("#SaveNewBtn,#SaveCloseBtn").show();
                            else
                                $("#SaveNewBtn,#SaveCloseBtn").hide();
                    } else  {
                        $("#"+lastCell.closest('table').attr('id')).removeClass("greyed-out");
                        $("#"+lastCell.closest('table').attr('id')).css("opacity",'1.0');
                    }
                    if ( lastFocusedEntry.length > 0) {
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).removeClass("greyed-out");
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).css("opacity",'1.0');
                    }
                   
                } 
                else {
                    if ( lastFocusedEntry.length === 0 ) { // overlay in prohjects or customers screen
                        lastCell=currCell;
                        addNewRec($("#overLay ul").attr("data-module"),e.target,"addSingleRec");  
                        
                    }
                    else { // overlay in Scheduler screen
                        lastCell=lastFocusedEntry[lastFocusedEntry.length-1].currCell;
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").hide();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").hide();
                        currentRecordPointer=0;
                        newEntry($(lastCell).closest('td'),lastCell.closest("table").find('[id="mainHeader"]').find(" tr th:eq("+lastCell.index()+")").text()); 
                    }
                    currCell.find("input").val("");     // reset the New Entry text
                }
            break;

            case "Escape"               :    // escape - just hide the list and back to the oringal cell
                $("#overLay ul").empty();
                $("#addSingleRec").removeClass("greyed-out");
                editing=false; // no more editing
                
                if (lastScreen != "Scheduler") { // return the focus to the cell
                    $(currCell).children().first().val("");
                    if (( currCell.id == "prjShortCut" ) || 
                        ( currCell.id == "prjShortCutGallery") ) {  // special case of project input field 
                        $(currCell).children().first().focus();// focus on the first input!!
                    }
                    else {     
                        currCell=$(currCell).closest('td'); // Identify the TD
                        $(currCell).children().first().focus();// focus on the first input!!
                    }
                } 
                else {
                    $(currCell).children().first().val("");
                    $(currCell).children().first().focus();
                }
                
                retValue=false;
            break;

            case "ArrowUp"              : 	
            case "ArrowDown"            :	
                currentRecordPointer=$("#uListID li").index(document.getElementById(event.target.id)); // get the current record
                document.getElementById(event.target.id).classList.remove("selectedLI");
                if (event.key == "ArrowUp") 
                    newIx=(currentRecordPointer-1<0?(document.querySelector(".uList").childElementCount)-1:currentRecordPointer-1); // if key pressed at the 0 record than wrapped around to the last
                else 
                    newIx=(currentRecordPointer+1) % document.querySelector(".uList").childElementCount; // modules the counter (wrap around if needed)
                
                windowLog.trace("Current id: "+currentRecordPointer+" New ID: "+newIx);
                //var new_event_id=event.target.id.split('-')[0]+'-'+newIx; // update the id to the new record id (take the first part after split)
                const new_event_id=$("#uListID li")[newIx];
                windowLog.trace("New event id: "+new_event_id.id);
                currCell.children().first().val(new_event_id.innerText);
                //Array.prototype.slice.call(document.querySelectorAll('ul[data-tag="channelList"] li')).forEach(function(element) {
                //    element.classList.remove('selectedLI');});	// Remove the selected class
                
                new_event_id.classList.add("selectedLI"); // add a new class-- color the new selected record
                new_event_id.focus();
                currentRecordPointer=newIx; // Save the currentPointer with the new location
                
                retValue=false;
            break;

            default                     :
                windowLog.trace("Default key pressed: "+event.keyCode);
                retValue=false;
        }

        return retValue;
    };

    function onChangeSignTime(event) {

        windowLog.trace("inside onChangeSignTime");
        totalLunchMinutes=0;
        //var index=event.target.id .split("+")[1];     // extract index from the ID
        var signin=0,  signout=0;
        const totalHoursID=$(event.target.parentNode).parent().find('[id^="totalHours"]')[0];
        const lunchSignIn=$(event.target.parentNode).parent().find('[id^="lunchSignInTimeID"]').val();
        const lunchSignOut=$(event.target.parentNode).parent().find('[id^="lunchSignOutTimeID"]').val();
         if ( (lunchSignIn != "") && (lunchSignOut != "") )
            totalLunchMinutes=Number(((new Date('2023-01-01T'+lunchSignOut))-(new Date('2023-01-01T'+lunchSignIn)))/60000);

        if ($('tr th')[$(event.target.parentNode).index()].innerText == "Job SignIn") { // user changed signin then td+3 is the signout   
            signin=event.target.value;
            signout=$(event.target.parentNode).parent().find('[id^="jobSignOut"]').val() ;
        }
        else { // user change signout so the previous td is sign in
            /*if ( event.target.value == "") 
                event.target.value =("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2);*/

            signout = event.target.value;
            signin = $(event.target.parentNode).parent().find('[id^="jobSignIn"]').val() ;
            //$(event.target.parentNode).prev().prev().prev().children().first().val(); // value of signin
        }
        if ( ( signin != "" ) && ( signout != "" ) ) {
            totalMinutes=Number(((new Date('2023-01-01T'+signout))-(new Date('2023-01-01T'+signin)))/60000);
            if ( totalLunchMinutes > 0 ) {
                totalMinutes -= totalLunchMinutes;  // deduct lunch time per Eyal 05-10
                windowLog.trace("Deduct lunchtime:"+totalLunchMinutes+" total labor minutes:"+totalMinutes);
            }
            if ( totalMinutes >= 60 ) {
                hours=Math.floor(totalMinutes / 60); 
                totalMinutes=totalMinutes % 60;
                if ( totalMinutes < 10 )
                    $(totalHoursID).val(hours+".0"+totalMinutes);
                else 
                    $(totalHoursID).val(hours+"."+totalMinutes);  
            }
            else {
                if ( totalMinutes < 0 ) { // warning signout before signin
                    $(totalHoursID).val("0.0");
                    windowLog.trace("Warning, Sign-in greater than Sign-out");
                }
                else {
                    if ( totalMinutes < 10 )
                        $(totalHoursID).val("0.0"+totalMinutes);
                    else 
                        $(totalHoursID).val("0."+totalMinutes);
                }
            } 
        }else
            $(totalHoursID).val("0.0");
        charactersCount++;
        if ( $(event.target.parentNode).parent().find('[name^="fullName"]').val() != "" ) // if employeename field is empty than avoid calculation
            calculateLaborCost(event.target);
        else
            windowLog.trace("employee name is empty, bypassing laborcost");

        //        windowLog.trace("changeTime:"+event.target.name+" ,value:"+event.target.value);
    }

    var totalLunchMinutes = 0;
    var totalMinutes=0;

    function onChangeLunchTime(event) {

        windowLog.trace("inside onChangeLunchTime:"+"value is:"+event.target.value+",old Value is:"+event.target.oldvalue);
        var lunchSignIn="", lunchSignOut="";

        if ( event.target.name == "lunchSignin") { // user changed signin then td+3 is the signout   
            lunchSignIn=event.target.value;
            if ( $(event.target.parentNode).parent().find('[id^="lunchSignOut"]').val() != "" )   // if lunch signout time is empty then do nothing
                lunchSignOut=$(event.target.parentNode).next().children().first().val(); // value of lunch signout
        }
        else { // user change lunch signout so the previous td is lunch sign in
            lunchSignOut=event.target.value;
            if ( $(event.target.parentNode).parent().find('[id^="lunchSignIn"]').val() != "" )
                lunchSignIn=$(event.target.parentNode).prev().children().first().val(); // value of lunch signin 
        }
        if ( (lunchSignIn == "") || (lunchSignOut == "") )    // if any of the lunch signin/out time is empty than reset both and calculate just signin-signout
            totalLunchMinutes = 0;
        else
            totalLunchMinutes=Number(((new Date('2023-01-01T'+lunchSignOut))-(new Date('2023-01-01T'+lunchSignIn)))/60000);
        windowLog.trace("lunch time(minutes):"+totalLunchMinutes);
        if ( totalLunchMinutes < 0 )    // minutes canot be negatove then restore the prevoous value
            event.target.value = lunchSignOut;
        else { // update the total hours
            const totalHoursID=$(event.target.parentNode).parent().find('[id^="totalHours"]')[0]; // get the total hours 
            const signIn=$(event.target.parentNode).parent().find('[id^="jobSignIn"]').val() ;
            const signOut=$(event.target.parentNode).parent().find('[id^="jobSignOut"]').val() ;
            if ( (signIn  != "" ) &&    // if signout time is empty then do nothing
                    (signOut != "" ) ) {
                    ToJobMinutes=Number(((new Date('2023-01-01T'+signOut))-(new Date('2023-01-01T'+signIn)))/60000);
                //totalHours=totalHoursID.value;

                //var ToJobMinutes=Number(totalHours.split(".")[0])*60 + Number(totalHours.split(".")[1]);
                if ( ToJobMinutes >=  totalLunchMinutes ) { // if lunch time is greater than the current total minutes- error
                    ToJobMinutes  -= totalLunchMinutes;     // deduct lunch time from the total job
                    event.target.oldvalue = event.target.value; // update the oldvalue with the current value 
                    const newJobTime=minutesToString(ToJobMinutes);
                    totalHoursID.value=newJobTime;
                }
                else
                    event.target.value = event.target.oldvalue;
            }
        }

        if ( $(event.target.parentNode).parent().find('[name^="fullName"]').val() != "" ) // if employeename field is empty than avoid calculation
            calculateLaborCost(event.target);
        else
            windowLog.trace("employee name is empty, bypassing laborcost");
    }

    function minutesToString(timeDecimal) {

        if ( timeDecimal >= 60 ) {
            hours=Math.floor(timeDecimal / 60); 
            totalMinutes=timeDecimal % 60;
            if ( totalMinutes < 10 )
               timeString=hours+".0"+totalMinutes;
            else 
                timeString=hours+"."+totalMinutes;  
        }
        else {
            if ( timeDecimal < 0 ) { // warning signout before signin
                timeString="0.0";
                windowLog.trace("Warning, SignIn greater than Sign-out");
            }
            else {
                if ( timeDecimal < 10 )
                    timeString="0.0"+timeDecimal;
                else 
                    timeString="0."+timeDecimal;
            }
        } 

        return timeString;
    }

    function setCellFocus() {

        $(currCell).children().first().focus();// focus on the first input!!
        //blurControlID=(currCell)[0].tabindex;
        origText = $(currCell).children().first().val();
        //$(currCell).children().first()[0].setSelectionRange(0,0);
        //setCellFocusVal();
        //$(currCell).children().first().focus();// focus on the first input!!
        windowLog.trace("setCellFocus:origText="+origText);
     }

    function setCellFocusVal() {

        //const val=$(currCell).children().first().val();
        //$(currCell).children().first().val(val); // move the cursor to the ned of the input
     //   $(currCell).children().first()[0].setSelectionRange(0,0);
        //windowLog.trace("setCellFocusVal:"+val);
    }

    function calculateLaborCost(e) {

        windowLog.trace("Insidee CalculateLabor");
        const eName=$(e.parentNode).parent().find('[name^="fullName"]').val();
        const id= classArray["Employees"].arr.findIndex(t => t.fullname == eName);

        var hr=Number(classArray["Employees"].arr[id].hourlyrate);
        windowLog.trace("name:"+eName+" hr:"+Number(classArray["Employees"].arr[id].hourlyrate));
        const totalHours=$(e.parentNode).parent().find('[name^="totalHours"]').val();
        const hours=Number(totalHours.split(".")[0]);
        const mins=Number(totalHours.split(".")[1]);
        windowLog.trace("hours:"+hours+" mins:"+mins);
        if ( hours > 8 ) {
            hourLabor = 8*hr;   // calculate first 8 hours using default hrate
            windowLog.trace("standard hours labor:"+hourLabor);
            hr *= 1.5;            // set the hrate for overtime
            hourLabor += (hours-8)*hr;       // calculate overtime
            windowLog.trace("Total hours labor:"+hourLabor);
        }
        else {
            hourLabor = hours*hr;               // calculate the labor with the base hourlyrate
            windowLog.trace("standard hours labor:"+hourLabor);
            if ( ( hours == 8 ) && (mins > 0) )
                hr *= 1.5;
        }
        hourLabor = hourLabor + (mins*hr/60);   // add minutes 
        $(e.parentNode).parent().find('[name^="labor_cost"]').val(hourLabor.toFixed(2));

        return hourLabor.toFixed(2);
    }


    function validateEnableSaveConditions(module,currentTR) {

        var trTextInputLen=0;
        windowLog.trace("Inside validation");
        
        switch ( module ) {
            case "Projects" :
                $(currentTR).find('td:gt(1)').each(function(iCol,iTD) { // start the loop past the project number
                    windowLog.trace("TD nodeName: "+iTD.childNodes[0].nodeName );
                    trTextInputLen += iTD.childNodes[0].value.length;
            });
        }
        
        return trTextInputLen > 0?true:false
        /*
        
        if ( currentTR.find('[id="prjctNumberID"]').val() != "" ||
             currentTR.find('[id="schdlrDcrptnID"]').val() != "" )     
            return true;
        else
            return false;*/
    }