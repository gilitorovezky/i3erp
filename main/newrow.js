    // add new row to any given table.
    // restore is set to 1 if the function is called to restore deleted record
    function addNewRow(newRecPntr,module,rowNumber,restore,parentElement) { // parentElement only relevant for Scheduler

        windowLog.trace("Inside addNewRow"+" newRecPntr:"+newRecPntr+" module: "+module+"- active:"+active);
        
        var row="";
        var ID=1;
        var tTabIndex=active; // Active points to the next TD to number
        //const date=new Date();
        var tempRow=[];
        var files=0;
        origText="";
        // reset the temp record
        for (var i = 0;i < 14;i++) // 14 is an arbitrary number, greater than the longest record
            tempRow.push({"value":""}); 
        
        var localCurrentTime; // =("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2); // dont set the time
        
        row = `<tr id="${module}">`;     // add the module mainly for scheduler since if the Installer is Select, disable the save button
        if ( ( newRecPntr === "#addSingleRec" )    || // Dont allow delete in single rec or Employees or Projects
             ( module  === "Employees" )        || 
             ( module  === "Customers" )        ||
             ( module  === "Projects" ) )
            row +=`<td></td>`;
        else
            row += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
        var index=5;    // runnng index over the record..       
        
        if ( restore ) { // in case of restore deleted Row, get the ID from the restored record, otherwise get the ID from the array 
            tempRow=deletedRow2[deletedRow2.length-1].map((x) => x);
            ID=tempRow[4].ID;
        }
        else {
            ID=lastID[module]+1; // add but dont save until the rec is saved
            tempRow[3].Name=""; // set the Name to empty
        }

        windowLog.trace("ID:"+ID);
        var tempDay=today;
        switch (module) {

            case "Projects" : //Adding projects only allowed from the home screen 

                if ( restore ) 
                    row += `<td><input type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" value='${tempRow[3].Name}'>`;
                else { 
                    var newPrjNumber=initialProjectNumber;
                    if ( Projects.arrProjects.length > 0 )  // grab the last project number in case table is not empty
                        newPrjNumber=Number(Projects.arrProjects[Projects.arrProjects.length-1].project_number)+1;
                    
                    row += `<td><input type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" value=${newPrjNumber}>`;
                }
                row += `<input type="hidden" id='${headers['Projects']['primaryKey']}' name="projectID" value=${ID}></td>`; 
                row += `<td><input tabindex="0" type="text" id="companyNameID" name="companytName" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                row += `<td><input tabindex="0" type="text" id="customerLastNameID" name="customerLastName" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                row += `<td><input tabindex="0" type="text" id="projectTypeID" name="projectType" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                row += `<td><input tabindex="0" type="text" id="projectSalesRepID" name="projectSalesRep" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                row += `<td><input tabindex="0" type="text" id="projectAddressID" name="projectAddress" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                row += `<td style="width:2%"><input tabindex="0" type="text" id="allFilesID" name="allFiles" class="projectNameClass" value="0"></td>`;
            break;

            case "Purchases" :
                
                row += `<td><input tabindex="0" type="text" name="projectName" id="prjctNumberID" class="projectNameClass" maxlength="200" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Purchases']['primaryKey']}' name="invoiceID" value=${ID}></td>`;
                row += `<td><input tabindex="0" type="text" id="vendorNameID" name="vendorName" id="vendorID" class="projectNameClass" maxlength="20" value='${tempRow[index++].value}'></td>`;
                row += `<td><input tabindex="0" type="text" name="invoiceNumber" id="invoiceNumberID" class="projectNameClass" maxlength="40" value=${tempRow[index].value}></td>`;
                amount='';
                if ( restore ) // undo the fields nnly if ctrlZ was down
                    amount=tempRow[++index].value;
                index++;
                row += `<td><input tabindex="0" type="text" id="invoiceAmountID" name="invoiceAmount" class="projectNameClass" maxlength="10" value=${amount}></td>`;
                row += `<td><input tabindex="0" type="date" id="invoiceDateID" name="invoiceDate" class="inputDate" value=${tempDay}></td>`;
                row += `<td><input tabindex="0" type="text" id="invoiceMethodID" name="invoiceMethod" class="projectNameClass" "maxlength="20" value=${tempRow[index++].value}></td>`;

                if ( restore )
                    tempDay=tempRow[index].value;
                index++;
                row += `<td><input tabindex="0" type="text" id="descriptionID" name="description" class="projectNameClass" maxlength="40" value=${tempRow[index].value}></td>`;
                row += `<td style="width:8%"><a tabindex="0" class="hyperlinkLabel" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`;
            break;

            case "Payments" :

                row += `<td><input tabindex="0" type="text" name="projectName" id="prjctNumberID" class="projectNameClass" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Payments']['primaryKey']}' name="pymntID" value=${ID}></td>`; 
                
                var amount='';
                if ( restore ) 
                     amount=tempRow[++index].value;
                row += `<td ><input type="text" name="paymentAmount" id="paymentAmountID" class="projectNameClass" value=${amount}></td>`;
                index++;    
                row += `<td><input tabindex="0" type="date" name="jobDate" id="jobPaymentDateID" class="inputDate" value=${tempDay}></td>`;
                row += `<td><input tabindex="0" type="text" name="paymentMethod" id="paymentMethodID" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                //row += `<td><input tabindex="0" type="text" name="referenceNumber" id="rnID" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                if ( restore ) 
                    tempDay=tempRow[index].value;
                index++;
                row += `<td><input tabindex="0" type="text" id="pnID" name="checkNumberCNF" class="projectNameClass" value=${tempRow[index].value}></td>`;
                row += `<td><input tabindex="0" type="text" id="descriptionID" name="pDscrptn" class="projectNameClass" maxlength="40" value=${tempRow[index].value}></td>`;
                if ( restore )
                    files=tempRow[index++].value;
                else
                    files=uploadFilesMngr(0,false);  
                row += `<td style="width:8%"><a class="greyed-out" tabindex="0" id="allFilesID" data-files="0" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;

            case "Employee Jobs" :

                row += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectName" class="projectNameClass" maxlength="200" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Employee Jobs']['primaryKey']}' name="taskID" value=${ID}></td>`;
                row += `<td><input tabindex="0" type="text" id="fullNameID" name="fullName" class="projectNameClass" maxlength="30" value=${tempRow[index++].value}></td>`;
                if ( restore ) 
                    tempDay=tempRow[index++].value;

                row += `<td><input tabindex="0" type="date" name="Date" id="jobDateID" class="inputDate" value=${tempDay}>`;
                var lunchSignInTime,lunchSignOutTime,jobSignOutTime="&nbsp:&nbsp";
                var totalHours = "0.00";
                var description="";
                var labor_cost = "0.0";
                if ( restore ) {
                    localCurrentTime=tempRow[index++].value;
                    lunchSignInTime=tempRow[index++].value;
                    lunchSignOutTime=tempRow[index++].value;
                    jobSignOutTime=tempRow[index++].value;
                    totalHours=tempRow[index++].value;
                    description=tempRow[index++].value;
                    labor_cost=tempRow[index].value;
                    files=tempRow[index++].value;
                }
                row += `<td><input tabindex="0" type="time" id="jobSignInTimeID" name="jobSigninTime" class="inputTime" value=${localCurrentTime}></td>`;
                row += `<td><input tabindex="0" type="time" id="lunchSignInTimeID" name="lunchSignin" class="inputTime" value=${lunchSignInTime}"></td>`;
                row += `<td><input tabindex="0" type="time" id="lunchSignOutTimeID" name="lunchSignOut" class="inputTime" value=${lunchSignOutTime}"></td>`;
                row += `<td><input tabindex="0" type="time" id="jobSignOutTimeID" name="jobSignOut" class="inputTime" value=${jobSignOutTime} ></td>`;
                row += `<td><input tabindex="0" type="text" id="totalHoursID" name="totalHours" readonly class="projectNameClass" maxlength="5" value=${totalHours}></td>`;
                row += `<td><input tabindex="0" type="text" id="descriptionID" name="description" class="projectNameClass" maxlength="20" value=${description}></td>`;
                row += `<td><input tabindex="0" type="text" id="lbrCostID" hidden name="labor_cost" class="projectNameClass" readonly value=${labor_cost}></td>`;
                row += `<td style="width:2%"><a tabindex="0" class="hyperlinkLabel" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;

            case "Sub Contractors" :

                row += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" value=${tempRow[index++].value}>`;
                row += `<input type="hidden" id='${headers['Sub Contractors']['primaryKey']}' name="taskID" value=${ID}></td>`;
                row += `<td><input tabindex="0" type="text" id="contractorNameID" name="ContractorName" class="projectNameClass" value='${tempRow[3].Name}'></td>`;
                if ( restore)
                    tempDay=tempRow[index++].value;
                row += `<td><input tabindex="0" type="date" id="jobDateID" class="inputDate" name="jobDate" value=${tempDay}></td>`;

                var amount='';
                if ( restore ) 
                    amount=tempRow[++index].value;
                row += `<td><input tabindex="0" type="text" id="paymentID" name="paymentAmount" class="projectNameClass" value=${amount}></td>`;
                index++;
                row += `<td><input tabindex="0" type="text" id="checkNumberID" name="checknumber" class="projectNameClass" value=${tempRow[index++].value}></td>`;
                if ( restore)
                    tempDay=tempRow[index++].value;
                row += `<td><input tabindex="0" type="date" id="jobPaymentDateID" name="jobPaymentDate" class="inputDate" value=${tempDay}></td>`;
                var descrpition="";
                if ( restore ) 
                    descrpition=tempRow[index++].value;
                row += `<td><input tabindex="0" type="text" id="descriptionID" name="description" class="projectNameClass" maxlength="40" value="${descrpition}"></td>`;
                if ( restore ) 
                    files=tempRow[index].value;
                row += `<td style="width:2%"><a tabindex="0" id="allFilesID" class="hyperlinkLabel" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;

            case "Employees" :

                row += `<td><input tabindex="0" type="text" name="fulltName" id="fullNameID" class="projectNameClass" maxlength="25" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Employees']['primaryKey']}' name="employeeID" value=${ID}>`;
                row += `<input tabindex="0" type="color" id="emplColorInput" class="emplColor" value="#ffffff"></td>`;
                row += `<td><input tabindex="0" type="text" name="employmentType" id="etID" class="projectNameClass" maxlength="10" value=${tempRow[index++].value}></td>`;
                var hourlyRate = 0.00;
                if ( restore ) {
                    hourlyRate=tempRow[index].value;
                    index++;
                }
                row += `<td><input tabindex="0" type="text" name="hourlyRate" id="hrID" class="projectNameClass" maxlength="5" value="${hourlyRate}"></td>`;
                if ( restore ) 
                 tempDay=tempRow[index].value;
                index++;
                row += `<td><input tabindex="0" type="date" name="hourlyRateDate" id="hrdID" class="inputDate" value=${tempDay}></td>`;
                //row += `<td tabindex="0"><input type="checkbox" name="isActive" id="iaID" value="IsActive" onclick="updateIsActive(event)">`;
                row += `<td><input tabindex="0" type="checkbox" name="isActive" id="iaID" value="IsActive">`;
                row += `<td><input tabindex="0" type="password" name="password" id="pswdID" class="projectNameClass" value="${tempRow[index++].value}" >`;
                row += `<label for="isActive"></td>`;
                 if ( restore )
                    files=tempRow[index].value;
                else
                    files=uploadFilesMngr(0,false);  
                row += `<td><a tabindex="0" class="hyperlinkLabel" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;
            
            case "Contractors" :
                
                row += `<td><input tabindex="0" type="text" name="Name" id="fullNameID" class="projectNameClass" maxlength="25" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Contractors']['primaryKey']}' name="contractorID" value=${ID}></td>`;                
                row += `<td><input tabindex="0" type="text" name="notes" id="notes" class="projectNameClass" maxlength="50" value=${tempRow[index].value}></td>`;
                if ( restore ) 
                    files=tempRow[index].value;
                row += `<td style="width:2%"><a tabindex="0" class="hyperlinkLabel" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;
            
            case "Vendors" :
                //if ( restore )                    
                //    ID= tempRow[4].ID;
                row += `<td><input tabindex="0" type="text" name="vendorName" id="vendorID" class="projectNameClass" maxlength="50" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Vendors']['primaryKey']}' name="vendorID" value=${ID}></td>`;
                row += `<td><input tabindex="0" type="text" name="vendorAddress" id="vaID" class="projectNameClass" maxlength="50" value=${tempRow[index++].value}></td>`;
                row += `<td><input tabindex="0" type="text" name="vendorNotes" id="vNotesID" class="projectNameClass" maxlength="50" value=${tempRow[index].value}></td>`;
                if ( restore ) 
                    files=tempRow[index].value;
                row += `<td style="width:2%"><a tabindex="0" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`;

            break;

            case "Hourly Rate" :
                row =  `<tr>`;  // only here no showing the minus image not to allow deletion
                row += `<td></td>`; // dummy td to confront with the other tables that minus icon occupies the first td
                row += `<td><input tabindex="0" type="text" name="hourlyRate" class="projectNameClass" maxlength="5" value=${tempRow[index++].value}>`;
                //row += `<input type="hidden" id="hrId" name="hrID" value=${tempRow[index++].ID}></td>`;
                row += `<input type="hidden" id='${headers['Hourly Rate']['primaryKey']}' name="hrID" value=${ID}></td>`;
                // here the hidden is in not under full name cause the first td is not a deleteion like all other tables
                if ( restore ) {
                    tempDay=tempRow[index].value;
                    index+=3;
                }             
                row += `<td><input tabindex="0" type="date" name="hourlyRateDate" id="hrdID" class="inputDate" value=${tempDay}></td>`;
                 
            break;

            case "Companies":
                // take the ID from the delete record
                if ( restore )                    
                    ID= tempRow[4].ID;
                row += `<td><input tabindex="0" type="text" name="companyName" class="projectNameClass" maxlength="50" value='${tempRow[3].Name}'>`;
                row += `<input type="hidden" id='${headers['Companies']['primaryKey']}' name="companyID" value=${ID}></td>`;
                row += `<td><input tabindex="0" type="text" name="companyNotes" class="projectNameClass" maxlength="50" value=${tempRow[index++].value}></td>`;
                if ( restore ) 
                    files=tempRow[index].value;
                row += `<td style="width:2%"><a tabindex="0" id="allFilesID" style="text-decoration:none;font-size:12px">${files}</a></td>`; //class="hyperlinkLabel" 
            break;

            
            //case "Leads" :
            //case "Estimates" :
            case "Scheduler" :
                const today=new Date();
                var description="";
                var labor_cost = "0.0";
                var taskDate="";
                var addEmpls=`<select tabindex="0" id="activeEmplListID">`;;
                if ( restore ) 
                    description=tempRow[2].value;
                prjNumber=tempRow[3].Name;
                if ( parentElement.id === "editTaskID" ) {    
                    iCol=$(parentElement).closest('td').index();
                    prjNumber=$(parentElement).closest('div[id="rootElement"]').find('[name="projectNumber"]').val();
                    description=$(parentElement).closest('div[id="rootElement"]').find('[name="schdPrjctDscrptn"]').val();
                    //taskDate=;
                    taskDate=formatDateForInput(new Date($('#result-table thead tr th:nth-child('+(iCol+1)+')').text()));
                    ID=$(parentElement).closest('div[id="rootElement"]').find('[name="taskID"]').val();
                
                    const activeEmplArr=classArray['Employees'].arr.filter((x) => x.is_active == "1").map((x) => x.fullname );      // array for all the assigned tasks  (employeeID = -1)
                    const employeeFName=$(parentElement).closest('tr').find('[id="employeeName"]').text();
                    //const formattedDate = formatDateForInput(today); // e.g., '2025-07-10'
                    addEmpls +=`<option value="`+employeeFName+`">`+employeeFName+`</option>`;  // build the active employee drop down menue
                    addEmpls += classArray["Employees"].arr.filter((x) => (x.is_active == "1" && x.fullname !=employeeFName)).map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);

                    if ( Tasks.unAssignedCount < Number(appConfig.maxUAtasksInRow) )
                        addEmpls +=`<option value="unassigned">UA</option>`;  // build the active employee drop down menue
                    //activeEmplys= classArray["Employees"].arr.filter((x) => x.is_active == "1").map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);
                } else {
                    if ( Tasks.unAssignedCount < Number(appConfig.maxUAtasksInRow) )
                        addEmpls +=`<option value="unassigned">UA</option>`;  // build the active employee drop down menue
                    addEmpls += classArray["Employees"].arr.filter((x) => (x.is_active == "1" )).map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);
                }
                addEmpls += `</select>`; //`<option value="select">Select</option>`+activeEmplys+`</select>`;
                addEmpls=addEmpls.replace(/\,/g, '');

                row += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" maxlength="200" value='${prjNumber}'>`;
                row += `<input type="hidden" id='${headers['Scheduler']['primaryKey']}' name="taskID" value=${ID}></td>`;
                //row += `<td tabindex="0" ><input type="date" id="jobDateID" name="jobDate" class="inputDate" value="${formattedDate}"></td>`;
                row += `<td><input tabindex="0" type="date" id="unAssgnTskDateID" name="jobDate" class="inputDate" min="${new Date().toISOString().split('T')[0]}" value="${taskDate}"></td>`;
                row += `<td><input tabindex="0" type="text" id="schdlrDcrptnID" name="description" class="projectNameClass" style="width:15vw" maxlength="20" value="${description}"></td>`;
                row += `<td>${addEmpls}</td>`;
                row += `<td style="width:2%"><a tabindex="0" class="hyperlinkLabel" id="allFilesID" style="text-decoration:none;font-size:12px" value="0">${files}</a></td>`;
                
                //row = `<tr class="rowContentPane"><td tabindex="0">td1</td><td>td2</td><td>td3</td></tr>`;
                               
            break;
        }

        switch (rowNumber) {    // add the raw based on the location

            case 0:
            case -1: // Special case to add the row in the singlerow screen
                $(newRecPntr+' thead').after(`<tbody class="thover">`+row+`</tr></tbody>`);
                break;

            default:
                $(newRecPntr+' tbody tr').eq(rowNumber-1).after(row+`</tr>`); // add the new row, decrease 1 since the row count start at 0
        }

        if ( module === "Scheduler" ) { // in case of Scheduler, add the time picker
            //$("#SaveNewBtn,#SaveCloseBtn").show();  // only for swcheduler allow save cquse the default user is UA and the date is irelevant and long as no user assigned
            $('[id^="unAssgnTskDateID"]').unbind("change");
            $('[id^="unAssgnTskDateID"]').change(function(event) {   // save the old value;
              
                windowLog.trace("Inside unAssgnTskDateID change event(newRow):"+this.value);
                if ( this.value != ""   && // show the save only if the Date is not null and eiher the projectname or the descrioption are not null
                    ($(this).closest('tr').find('[id="prjctNumberID"]').val() != "" ||
                    $(this).closest("tr").find('[id="schdlrDcrptnID"]').val() != "") )
                    $("#SaveNewBtn,#SaveCloseBtn").show();
                else
                    $("#SaveNewBtn,#SaveCloseBtn").hide();
                
                return false;
            });
        }
        $('[id^="lunchSign"]').unbind("focus");
    
        $('[id^="lunchSign"]').focus(function() {
            this.oldvalue = this.value;
        
            return false;
        });
        
        $('[id^="lunchSign"]').unbind("change");
        $('[id^="lunchSign"]').change(function(event) {   // save the old value;
            onChangeLunchTime(event)
            return false;
        });
        $('[id^="jobSign"]').unbind("change");
        $('[id^="jobSign"]').change(function(event) {   // save the old value;
            onChangeSignTime(event)
            return false;
        });
                
        /*var newTabIndex=1;
        $(newRecPntr+' tbody tr').each(function() {

            if ( $("#screen_name").html() == "Hourly Rate" ) {
                $(this).find('td').each(function(iTD,td) { // only in case of Hourly Rate screen start at 0 cause there is no delete td
                    td.tabindex = newTabIndex++; // update the tabindex
                }); 
            }
            else {
                $(this).find('td:gt(0)').each(function(iTD,td) {
                //step++;
                    td.tabindex = newTabIndex++; // update the tabindex
                    // in case of sign in/signout or total hours then update the children tabindex
                    if ( ($('tr th')[iTD+1].innerText == "Sign In")  ||
                         ($('tr th')[iTD+1].innerText == "Sign Out") ||
                         ($('tr th')[iTD+1].innerText == "Total Hours") ) {
                           // const myArray = $(this).children().first()[0].id.split("+"); // split the ID
                           // $(this).children().first()[0].id=myArray[0]+'+'+td.tabindex;
                    }
                }); 
            }
        }); */

        /* $('#'+parentElement).on('change',{paneName        :   paneName,
                                      parentElement   :   parentElement,
                                      prjNUmber       :   prjNumber,
                                      eventTarget     :   eventTarget,
                                      parentFolder    :   parentFolder,
                                      callType        :   callType},function(event) {
        if ( event.target.id != "prjTreeID" )
            onChangeUploadFilesForm($("#"+event.target.id)[0],event.data);    // pass the file element and the project number to name the file
    })*/
    }

    function addNewRec(module,element,newRecordPntr) {   // element is only used in Scheduler to edit the task

        var out="";
        active=0;

        windowLog.trace("Entering addNewRec module:"+module+"-active:"+active);

        //$("#main-menue,#navID").addClass("greyed-out");
       
        if ( $("#screen_name").html() != "Home")
            $("#editCBID").prop( "checked", true );   // turn on to allow edit in tblkeydown 
      
       //lastScreen=screenName; 
        //$('#result-table1').html(""); // reset any old table

        if ( headers[module]['showInPrj'] ) {// add project number to header? 
            out = `<thead id="mainHeader"><th></th><th class="pmClass">Project Number</th>`;
            //out += headers[lastScreen]['columns']+`</thead>`; // first th is a place holder to the del image
        }
        else {
            if ( module !== "Projects" )    // special case
                out = `<thead id="mainHeader"><th></th>`;
        }
        out += headers[module]['columns']+`</thead>`; // header is already included
        out += `<tfoot style="border-bottom:none"><tr id = "footerRow" style="border-bottom:none"><td colspan=${headers[module]['numOfCols']}>`;
        if ( newRecordPntr === "addSingleRec" ) // show the SaveandNew only in case of single record
            out += `<center><input hidden tabindex="0" style="background-color: #93d7e0;" class='button' type="submit" value="Save & New" id="SaveNewBtn">`;
        out += `<input hidden tabindex="0" style="background-color: #a1c3f2;" class='button' type="submit" value="Save & Close" id="SaveCloseBtn">`;
        out += `<input tabindex="0" style="background-color: #52b5f3;" class='button' type="submit" value="Cancel" id="CancelSnglRecBtn"></center></td>`;
        out += `</tr></tfoot>`;
        
        $('#'+newRecordPntr).html(out);
       
        addNewRow('#'+newRecordPntr,module,-1,0,element); // -1 is a special case, 0 indicate the row number
        //if ( element.id === "mainNewTaskSchdlr" ||
        //     element.id === "newTaskSC" )
        //    $("#SaveNewBtn,#SaveCloseBtn").hide();
       // if ( element.id === "editTaskID" ) // only show by defaukt the buttons when its called from Scheduler editTaskID 
        $('#'+newRecordPntr).css({'top':50+(5*(lastFocusedEntry.length))+"%"});
        $('#'+newRecordPntr).show();
       
        windowLog.trace("Register keydown handler for "+newRecordPntr);
        
        if ( module === "Projects" ) // only in Projects focus on the 2nd field not allowing to change the project number
            currCell = $('#'+newRecordPntr+' tr td:eq(2)').first();
        else
            currCell = $('#'+newRecordPntr+' tr td:eq(1)').first();
        
        lastFocusedEntry.push({"currCell":currCell,"recPntr":newRecordPntr,"module":module}); // push the current focused entry to the stack
        currCell.children().first().focus();
        currCell.children().first().css({'background-color'    : '#90e9e9'}); // highlight the editing field

        $("#"+newRecordPntr).unbind('click keydown');
        $("#"+newRecordPntr).on('click keydown',
                                {module         : module,
                                 eID            : element.id,
                                 newRecordPntr  : newRecordPntr,
                                 focusedElement : currCell.children().first()},function(elementRec) {  // add module to the bubble record
            windowLog.trace("Inside addNewRec "+newRecordPntr+" click keydown event, module:"+elementRec.data.module+",eID:"+elementRec.data.eID+",id:"+elementRec.target.id);
            switch ( elementRec.target.id ) {
                case "SaveNewBtn"           :
                     if ( elementRec.type === "click" || 
                         (elementRec.type === "keydown" && elementRec.key === "Enter") ) {
                        retSave=saveAndNew(elementRec);  // saveSingleRec is wrapped inside 
                        if ( module !== "Scheduler" )
                            $("#SaveNewBtn,#SaveCloseBtn").hide();  // hide the two save buttons
                    }
                break;
            
                case "SaveCloseBtn"         :
                    if ( elementRec.type === "click" || 
                        (elementRec.type === "keydown" && elementRec.key === "Enter") )
                        saveResult = saveSingleRec(elementRec);	// save the record and continue like cancel to close the record
                    else 
                        windowLog.trace("Inside SaveCloseBtn keydown enter");
                    if ( lastFocusedEntry.length > 1 ) {
                        lastFocusedEntry[lastFocusedEntry.length-2].currCell.children().first().val(lastFocusedEntry[lastFocusedEntry.length-1].currCell.children().first().val());
                        lastFocusedEntry[lastFocusedEntry.length-2].currCell.children().first().focus();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-2].recPntr+" tfoot tr td").find("input[id='SaveNewBtn']").show();
                        $("#"+lastFocusedEntry[lastFocusedEntry.length-2].recPntr+" tfoot tr td").find("input[id='SaveCloseBtn']").show();
                    }
                    
                case "CancelSnglRecBtn"     :
                    if ( elementRec.type === "click" || 
                         (elementRec.type === "keydown" && elementRec.key === "Enter") ){
                        if ( $("#screen_name").html() === "Scheduler" ) 
                            $("#caption,#result-table").removeClass("greyed-out");
                        cancelSingleRecDlg(elementRec.data.newRecordPntr);
                    } else  
                        windowLog.trace("Inside CancelSnglRecBtn keydown enter");

                //$("#main-menue,#navID").removeClass("greyed-out");
                break;

                case "allFilesID"           :

                    if ( elementRec.type === "click" || 
                        (elementRec.type === "keydown" && elementRec.key === "Enter") ){
                        showFileUpload(elementRec.target,"generalUpload","fileUploadControl",lastScreen);
                        //showFileUpload(elementRec.target,"generalUpload","aboutDialog",lastScreen);
                    } else 
                        windowLog.trace("Inside allFilesID keydown enter");
                break;

                case "footerRow"            :
                        windowLog.trace("Inside footerRow");
                    break;
                default                     :
                if ( elementRec.target.closest('tr').id !== "footerRow" ) {
                    $(currCell).children().first().css({'background-color'    : '#f1f6f5'}); // remove the highlight from the current cell        
                    currCell=$(elementRec.target).closest('td');
                    if ( lastFocusedEntry.length > 0 )     // greater than 0 means there is a last focused entry to return to
                        lastFocusedEntry[lastFocusedEntry.length-1].currCell=currCell; // update the currCell with the last focused entry
                    $(currCell).children().first().css({'background-color'    : '#90e9e9'}); // highlight the editing field
                    if ( elementRec.type === "keydown" && elementRec.target.type !== "date" ) {
                        $(currCell).children().first().focus();
                        
                        TblKeyDown(elementRec);
                    }
                }
            }
        });

        /*$("#myElement").on({
                click: function() {
                    // This function executes only on click.
                    alert("Element clicked!");
                },
                mouseenter: function() {
                    // This function executes only on mouseenter.
                    $(this).css("background-color", "yellow");
                },
                mouseleave: function() {
                    // This function executes only on mouseleave.
                    $(this).css("background-color", "");
                }
                });*/

        return false;
    }
    
    function cancelSingleRecDlg(recDlg) {

        windowLog.trace("Inside cancelSingleRecDlg");
        if ($("#overLay ul li").length > 0)
            $("#overLay ul").empty();

        closeSingleDlg(recDlg);
        /*if ( screenNumber === "home" ) 
            $("#prjShortCut").focus();
        else
            $("#upperLeft").focus();*/

        /*switch(lastScreen) {
            case "Projects"			:
            break;

            case "Employee Jobs"    :
            break;

            case "Payments"         :
            break;

            case "Sub Contractors"  :
            break;
            
            case "Purchases"        :
            break;

            default:
            break;
        }*/
       
        return false;
    }

    function closeSingleDlg(recDlg) {
        
        windowLog.trace("Inside closeSingleDlg");

        $('#'+recDlg).html("");
        $('#'+recDlg).hide();
        //$addSingleRec
       
        if ( lastFocusedEntry.length === 1) {      
            $("#navID,#main-menue,#customers,#tHalf,#projectLbl,#innerCellID,#Pl,#caption,#result-table").removeClass("greyed-out");
            $('img[id^="Pls"]').removeClass("greyed-out");
            lastFocusedEntry=[]; // remove the last focused entry from the stack 
        }
        else {
            $('#newRecDiv-'+(lastFocusedEntry.length-1)).remove();// remove the element
            lastFocusedEntry.pop(); // remove the last focused entry from the stack
            $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).removeClass("greyed-out");
            $("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).css("opacity",'1.0');

            //$("#addSingleRec").show();
            //$("#"+lastFocusedEntry[lastFocusedEntry.length-1].recPntr).removeClass("greyed-out");
            //currCell = lastSelctedListItem; //   restore the last selected item to be the current cell first child
            currCell=lastFocusedEntry[lastFocusedEntry.length-1].currCell;
            currCell.children().first().focus();   // restore the focus to the last selected item
        }

        charactersCount=0;
    }

    function formatDateForInput(date)   {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2,'0');
        return `${year}-${month}-${day}`;
    }

    function formatCurrentTime(date)    {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
