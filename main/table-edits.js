
function resetRecord(parentTable,start) {

    // loop throu the TD of the first row
    $(parentTable+' tbody tr:nth-child(0) td:gt('+start+')').each(function(iTD,TD) {

        let value=0;
        //switch ($(parentTable+' th:nth-child('+(iTD+1)+')').html()) {
        switch ( $(parentTable+' th:nth-child('+$(this).index()+')').html() ) {
            case "Gas"              :
            case "Files"            :
                value="0";
                break;

            case "Job Date"         :
            case "Payment Date"     :
            case "Date Created"     :
            case "Invoice Date"     :
            case "Payment Date"     :   
            case "Hourly Rate Date" :  
            case "Date Paid"        :   
                value=today;
                break;

            case "Job SignIn"       :
            case "Job SignOut"      :
            case "Lunch SignIn"     :
            case "Lunch Sign Out"   :
                value= ("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2);
                break;

            case "Invoice Amount"   :
            case "Payment Amount"   : 
            case "Total Hours"      :   
                value = "0.00";
                break;

            case "Installer"        :
                value = "select";
                break;  

            default                 : 
                value = "";
        }
        TD.childNodes[0].value=value;
    });
}

function deleteRow(event) {
	
    $("#saveTableLabel").html("Deleting..");
    $("#saveTableLabel").show();

    const rowNumber=$(event.target).closest('tr')[0].rowIndex;
    
    //const tableID='#'+$(event.target).closest('table').attr('id'); // get the table ID since this called from singletable and from the result-table

    const rows = $('#result-table1 tbody tr').length;  // count the rows
    tempRec=[];
    
    deleteOnce=false;
    
    windowLog.trace("Inside deleteRow Screen:"+document.getElementById("screen_name").innerHTML);
    tempRec.push({"screenName":document.getElementById("screen_name").innerHTML,"tableName":headers[lastScreen]["tableName"]}); 
    tempRec.push({"key":headers[lastScreen]["primaryKey"]});
    tempRec.push({"rowNumber":rowNumber}); 
    
    // Save the two fielkds of the first TD
    prjName=$('#result-table1 tbody tr:nth-child('+(rowNumber)+')')[0].childNodes[1].childNodes[0].value;

    ID=$('#result-table1 tbody tr:nth-child('+(rowNumber)+')')[0].childNodes[1].childNodes[1].value;
    //event.target.closest('tr td:nth-child(1)').find('[name^="project"]');
    tempRec.push({"prjName":prjName}); // Do not change the order of push
    tempRec.push({"ID":ID});     // Do not change the order of push
    
    const prjID=Projects.pNames.indexOf(prjName); // obtain the id from fhe prject nameProject ID
    // save the data of the row before delete for future restore. decrease 1 from rowNumber since the count starts at 0
    // Start the TD count from 2 to skip the first two: delete and the field already saved above
    $('#result-table1 tbody tr:nth-child('+rowNumber+') td:gt(1)').each(function(iTD,TD) { 
        
        if ( prjID >= 0 ) {
            switch ($("#result-table1"+' th:nth-child('+(iTD)+')').html()) {

                case "Invoice Amount"   : // apply to purchases screen
                    const invoiceAmount=$("#result-table"+' tr:nth-child('+rowNumber+') td:nth-child('+(iTD)+')').children().first().val();
                    
                    Projects.arrProjects[prjID].project_total_purchases-=Number(invoiceAmount);
                    break;

                case "Payment Amount"   : // applicablee to constactor_jobs and payments screen
                    const paymentAmount=$("#result-table"+' tr:nth-child('+rowNumber+') td:nth-child('+(iTD)+')').children().first().val();
                    
                    if ( lastScreen === "Payments")
                        Projects.arrProjects[prjID].project_total_payments-=Number(paymentAmount);
                    else // constructor_jobs
                        Projects.arrProjects[prjID].project_total_cntrc_cost-=Number(paymentAmount);
                    break;
            }
        }
        if ( TD.childElementCount > 0 ) {
            if ( TD.childNodes[0].nodeName === 'INPUT' ) // special case to get value property         
                value=TD.childNodes[0].value;
            else 
                value=TD.childNodes[0].innerText;
        }
        else 
            value=TD.innerText;
        tempRec.push({"value":value}); // append to the array			
    });
    deletedRow2.push(tempRec);

    if ( rows > 1 ) {
        document.getElementById('result-table').deleteRow(rowNumber); // delete the requested row
        var newTabIndex=1;
        // renumber the tabindex
        /*$('#result-table tbody tr').each(function(iRow,row) {
            $(this).find('td:gt(0)').each(function(iTD,td) {   
                td.tabindex =newTabIndex++;
                const header=$('tr th')[iTD+1].innerText;
                if ( (header == "Job SignIn")  ||
                     (header == "Job SignOut") ||
                     (header == "Lunch SignIn") ||
                     (header == "Lunch SignOut") ||
                     (header == "Total Hours") ) {
                        const myArray = $(this).children().first()[0].id.split("+"); // split the ID
                        $(this).children().first()[0].id=myArray[0]+'+'+td.tabindex;
                }
            }) 
        });*/
    }
    else { // last row left.. empty the record
        windowLog.trace("Last row - reset the fields");
        resetRecord('#result-table1',0);
        currCell = $('#result-table tbody tr:nth-child(0) td:nth-child(1)').first();
        DelCounter=false;
    }

    setCellFocus();	        // Set the focus at the first cell
    deleteFromDB(tempRec);  // delete the record from the DB

    return false;
}

function deleteFromDB(rec2Delete) {
    
    const prjName=rec2Delete[3].prjName;
    $.ajax({
            url     : "../db/delete_row.php",
            method  : "POST",
            data    : {postData:rec2Delete},
            dataType: "text"
    })
    .done(function (data) { 
        const ret_value=Number(JSON.parse(data).Status);
        windowLog.trace("Deleted row "+(ret_value > 0?"succesfully":"failed")); 
        if (ret_value > 0) {    // > 0 success, < 0 - error
            lastID[lastScreen]--;   
            const entryNumber=classArray[lastScreen].retEntrybyID(rec2Delete[4].ID); // get the entry number in the corresponding array
            if ( entryNumber >= 0 ) {
                classArray[lastScreen].arr.splice(entryNumber, 1);      // remove the item from the correspoinding array
                if (classArray[lastScreen].pNames.length)  
                    delete classArray[lastScreen].pNames[rec2Delete[3]];
            }
           
            switch (lastScreen) { // for now only case of Employee jobs, other cases are taken cre one level up due to hourly rate calculation at the DB level
                case "Employee Jobs" :   
                    const prjID=Projects.pNames.indexOf(prjName); // Project ID
                    if ( prjID >= 0 )
                        Projects.arrProjects[prjID].project_total_empl_cost=Number(JSON.parse(data).totalLabor);
                    else 
                        windowLog.trace("prjID not found:"+prjName);
                break;
            }
        }
        else
            $("#saveTableLabel").val("Error while Deleting");
    })
    .fail(function (jqXHR, textStatus, errorThrown)  { 
            windowLog.trace(errorThrown); });
}

// Main funtion to save record to the DB, either adding or replacing
function saveRow(moduleName,element) {

    var rootDir="";
    var arrObj=[];
    let tempRow=[];
    var tempRow2={};	// experiment temp array to save the cell content
    var allowSave = true;
    var fullProjectName="";    // hold the full project name
    var projectSet=false;   // Flag to indicate if the screen is project related screen
    let saveUrl="../db/save_record.php"; // default save URL, changed for Scheduler
    //var headerPTR="";
    var isNewRecord=false;

    if ( lastFocusedEntry.length > 0 ) 
        isNewRecord=true;
    
    windowLog.trace("Inside saveRow..module:"+moduleName+" LastScreen:"+lastScreen);
 
    windowLog.trace("Key:"+headers[moduleName]['primaryKey']);
    row=element.closest('tr');  // get the tr of the focused element
    targetTR=row;

    const idName=headers[moduleName]['primaryKey'];

    let ID = $(row).find('[id='+idName+']').val();
    
    switch( moduleName ) { // Add hidden header at the end only at Hourly Rate, Employees and projects

        case "Hourly Rate"      :
           
            break;

        case "Employees"        :

            tempRow2['fullname']=$(targetTR).find('[id="fullNameID"]').val();
            tempRow2["password"]=$(targetTR).find('[name="password"]').val();;
            break;

        case "Projects"         :
        case "Employee Jobs"    :
        case "Sub Contractors"  :
        case "Purchases"        :
        case "Payments"         :
            rootDir=appConfig.root_projects;
            //prjName=$(row).find('[id="prjctNumberID"]').val();
            //tempRow.push(prjName); // entry 1 append the project name
            //tempRow2['prjName']=prjName;
            break;

        default                 :
            rootDir=appConfig.config_dir+(moduleName).toLowerCase();
        break;     
    }

    if ( typeof ID === "undefined") {
        ID = -1;
        windowLog.trace("saveRow exception: ID is undefined");
    }

    tempRow.push(ID);   // entry 0 append the primary key to the record
    tempRow2[headers[moduleName]['primaryKey']] = ID;

    arrObj["entry0"]= {"moduleName"    :   moduleName,     // entry 0
                       "subFolderName" :   "",   // will be updated later with the contactanation of all the fields record
                       "newFolderName" :   "",
                       "keyName"       :   headers[moduleName]['primaryKey'],
                       "tableName"     :   headers[moduleName]['tableName'],
                       "rootDir"       :   rootDir,
                       "headers"       :   headerToDBFieldLookup[moduleName]};

    /*arrObj.push({"moduleName"   :   moduleName,     // entry 0
                 "subFolderName":   "",   // will be updated later with the contactanation of all the fields record
                 "newFolderName":   "",
                 "rootDir"      :   rootDir}); */
    //arrObj.push({"headers"      :   headers1});     // entry 1 for future use, currently the headers are taken hard look up table in save_table2 modulke
    //arrObj.push({"headers2"     :   headerToTableSchema[moduleName]}); // entry 2 - mapping of header to table schema

    //arrObj.push({"tableName"    :   headers[moduleName]['tableName']}); // entry 2
    // Start the loop over the TD from the 2nd TD, the first TD (pos 0) is the del icon, the 2nd TD(pos 1) is with two inputs
    var contactAllFields=ID+"-";    // every folder starts with the unique ID to differntiate 
    const tTable=element.closest('table');
    $(row).find('td:gt(0)').has(":text").each(function() { //} $(row).find('td:gt(0)').each(function(iCol) {   //$(this).find('td:gt(1)').each(function(iCol,iTD) {   
        const value=this.childNodes[0].value;
        //var value=0;
        //var value = this.childNodes[0].value;
        /*if ( this.childElementCount > 0 ) {
            switch ( this.childNodes[0].nodeName ) {
                case "INPUT"    :
                case "TEXTAREA" :
                case "SELECT"   :
                    if ( this.childNodes[0].value == "IsActive")       
                        value = this.childNodes[0].checked==false?"0":"1";
                    else 
                        value = this.childNodes[0].value;
                break;

                
                //    value=this.childNodes[0].value;
                    break

                default:
                    value=this.childNodes[0].innerText;
            }   
        }
        else {
            windowLog.trace("childElementount is Zero");
            value=this.innerText;
        }*/
        windowLog.trace("SRow,headerID:"+this.childNodes[0].id+" value:"+value);
        tempRow.push(value); // append to the array
        //const tiCol=iCol+2;  // since iCol starts at 0 and the loop starts at td:gt(1), need to add 2 to the actual counter
        //const header=$('#mainHeader tr th:nth-child('+tiCol+')').html();
        
        //const header=$(element.closest('table').find(' thead th:nth-child('+((this.cellIndex)+1)+')')).html();
        const header=$(tTable.find(' thead th:nth-child('+((this.cellIndex)+1)+')')).html();
        tempRow2[header]=value;
        //const header=$(element.closest('table').find(' thead th:nth-child('+(tiCol)+')')).html();
        //$("#"+headerPTR+" thead th:nth-child('+(tiCol+1)+')'").html();
        //$("#"+headerPTR+" thead th
        
        //$(element).closest('table').find(" thead th:nth-child('+(tiCol+1)+')'").html();
        //$(element).closest('table').find("thead th:nth-child('+(tiCol+1)+')').html();
        
        const execludeList = ["Files", "Installer"];

        const includesAnyKeyword = execludeList.some(keyword => header.includes(keyword));

        if ( !includesAnyKeyword ) // skip the value if the header is in the execludeLizt
            contactAllFields += value;
    });

    //$(row).find("td:has(a[data-files])").each(function() {});

    tempRow2["Files"]=Number($(row).find("a[id='allFilesID']").attr("data-files"))
  
    $(row).find("td:has(input[type='date'])").each(function() {
        const header=$(tTable.find(' thead th:nth-child('+((this.cellIndex)+1)+')')).html();
        tempRow2[header]=this.childNodes[0].value;
    });

    $(row).find("td:has(input[type='time'])").each(function() {
        const header=$(tTable.find(' thead th:nth-child('+((this.cellIndex)+1)+')')).html();
        var value = "0.00"
        if ( this.childNodes[0].value.length > 0 )
            value=this.childNodes[0].value;
        tempRow2[header]=value;
    });

    arrObj["entry0"].subFolderName=contactAllFields;   // update the subFolder with the contacnation of all the record fields// set default`
    if ( !isNewRecord ) { //if its not a new record than the entry must be found
        entryNumber=classArray[moduleName].retEntrybyID(Number(ID));
        //if ( entryNumber >= 0 )  { // valid entry found : exisiting record 
            tempRow[tempRow.length-1]=classArray[moduleName].arr[entryNumber].file_uploaded; // update the file_uploaded (replace the upload file(s)) if exist
            tempRow2["Files"] = tempRow[tempRow.length-1];
            if ( ( classArray[moduleName].arr[entryNumber].foldername != "" ) || 
                ( typeof classArray[moduleName].arr[entryNumber].foldername != "undefined" ) ){
                arrObj["entry0"].newFolderName=contactAllFields;
                arrObj["entry0"].subFolderName=classArray[moduleName].arr[entryNumber].foldername;
            }
    }

    tempRow2["isNewRecord"]=isNewRecord; 

    switch (moduleName) {

        case "Projects":
            projectSet=true;
            // construct the full projct name: number+company_name+cstmr_name+add+proj type+prj_mngr
            //fullProjectName=tempRow[1]+"-"+tempRow[2]+"-"+tempRow[3]+"-"+tempRow[4]+"-"+tempRow[5]+"-"+tempRow[6]; // must change to a function 
            fullProjectName=tempRow2["Project Number"]+"-"+tempRow2["Company Name"]+"-"+tempRow2["Customer Last Name"]+"-"+tempRow2["Project Type"]+"-"+tempRow2["Project Manager/Rep"]+"-"+tempRow2["Project Address"];
            tempRow.push(fullProjectName); // entry #7
            //const tToday=new Date();
            //const tempDAte=formatDateForInput(new Date()); // e.g., '2025-07-10'
            const currentTime=formatCurrentTime(new Date())
            const sqlDate=formatDateForInput(new Date());
            tempRow.push(sqlDate+" "+currentTime);      // entry #8 - create project timestamp
            tempRow.push(appConfig.root_projects);    // entry #9 - root folder for all the project folerds
            tempRow2["projectname"]=fullProjectName;  
            tempRow2["createdtime"]=sqlDate+" "+currentTime;
            tempRow2["rootFolder"]=appConfig.root_projects;
        break;

        case "Hourly Rate"  :
            tempRow.push($('th:nth-child(1)')[0].id); // push the employee_id that saved in the table hidden
            tempRow2["employeeID"]=$('th:nth-child(1)')[0].id;
        break;

        case "Employee Jobs"    : // employee_name is part of employee_jobs abd contracdtor_jobs records only
            
            var eID=-1;
            var hourlyrate=0;   // set $0 default  just in case employee name cannot be found
            var laborCost=0;
            if ( tempRow[2].length > 0 ) {  //  get the employeeID from the employeename otherwise set to -1
                eID = ( (tempRow[2] == "" || typeof eID == "undefined")?-1:classArray["Employees"].pNames[tempRow[2]]); // if  employee name not found (partial name due to blur in the middle of editing)
                if ( eID > 0 ) { // if employeeID is valid then get the hourlyrate to pass down to  save_record
                    tempRow.push(eID);
                    tempRow2["employeeID"]=eID;    
                    hourlyrate=classArray["Employees"].arr[classArray["Employees"].retEntrybyID(eID)].hourlyrate;
            
                    const entry=classArray["Employee Jobs"].retEntrybyID(ID);
                    if ( ( element.name == "fullName" ) &&   // in case the employee name changed than calculate the new labor based on the new hourly rate
                         ( classArray["Employee Jobs"].arr[entry].employee_fname != element.value ) ) {
                        windowLog.trace("New employee name found, calculate new labor (old:"+classArray["Employee Jobs"].arr[entry].employee_fname+" new:"+element.value+")");
                        laborCost=calculateLaborCost(element);    // update the new labor
                    }
                }
                else {
                    windowLog.trace("Warning: Inside saveRow..module:"+moduleName+" LastScreen:"+lastScreen+" invalid eID- use blank");
                    //allowSave = false;
                    element.value="";       // reset the field
                }
            }
            $(targetTR).find('[name^="labor_cost"]')[0].value=laborCost // reset the labor cost
            //$(element.parentNode).parent().find('[name^="labor_cost"]')[0].value=laborCost // reset the labor cost
            //tempRow[10]=laborCost;
            //tempRow.push(eID);
            //tempRow.push(hourlyrate);    
            tempRow2["employeeID"]=eID
            tempRow2["hourlyrate"]=hourlyrate;
            tempRow2["laborcost"]=laborCost;
            tempRow2["projectID"]=Projects.retEntrybyID(tempRow2["Project Number"].split("-")[0]);
            
        case "Sub Contractors"  :
            if ( tempRow2["Payment Amount"] === "") // if payment_amount is empty then set the field to 0.00
                tempRow2["Payment Amount"] = 0.00;
        case "Purchases"        :
        case "Payments"         :
            fullProjectName=tempRow[1];
            projectSet=true;    // set the projectSet flag to true for Purchases and all of EJ, Payments and SC
            //tempRow.push(contactAllFields); // push the employee_id that saved in the table hidden
            tempRow2["Folder Name"]=contactAllFields;
        break;

        case "Employees"        :
            
            if ( $(targetTR).find('[id="fullNameID"]').val() != ""  &&
                 $(targetTR).find('[name="password"]').val() != "" )  { // only save if the employee name nd Password are at least entered
                //tempRow[$('#mainHeader').find('th:contains("Password")').index()]=""; // mask the password 
                //tempRow2["Password"]="";
                if ( lastID["Employees"] < Number(ID) ) {           // is this a new row
                    tempRow.push(formatDateForInput(new Date()));   // yes- push today's date as start date
                    tempRow2["startdate"]=formatDateForInput(new Date());
                    tempRow2["profile_color"]=$(targetTR).find('[id="emplColorInputID"]').val();
                    tempRow2["is_newEmployee"]="1";
                }
                else {
                    tempRow2["is_newEmployee"]="0";
                    tempRow.push(classArray["Employees"].arr[classArray["Employees"].retEntrybyID(ID)].startdate);  // push the start date which is today
                    tempRow2["startdate"]=classArray["Employees"].arr[classArray["Employees"].retEntrybyID(ID)].startdate;
                    tempRow2["profile_color"]=classArray["Employees"].colors[$(targetTR).find('[id="fullNameID"]').val()];
                }
                if (element.name == "hourlyRate") {
                    tempRow.push("newRate");
                    tempRow2["hourlyRateType"]="newRate";
                }
                else {
                    tempRow.push("currentRate");
                    tempRow2["hourlyRateType"]="currentRate";
                }
            }
            else {
                windowLog.trace("Warning: fullname is empty - skip saving");
                allowSave = false;
                $("#saveTableLabel").html("Both Full name and Password must be entered...");
                $("#saveTableLabel").show();
                setTimeout(() => $("#saveTableLabel").hide(), 2000); // clear the message after x sec
            }
           
        break;

        case "Companies"        :
            tempRow2["Orig Company Name"]="";
           /* if ( element.id === "cmpnyNameID" ) {   // save the origText only if the updated field is the company name
                tempRow.push(origText);             // push the orig company name
                tempRow2["cmpnyNameID"]=origText;
            }
            else {
                tempRow.push("");             // push ""
                tempRow2["cmpnyNameID"]="";
            }*/
        break;

        case "Vendors"          :
            tempRow2["Orig Vendor Name"]="";

            /*if ( element.id === "vendorNameID" ) {      // save the origText only if the updated field is the vendor name
                tempRow.push(origText);          // oush the orig company name
                tempRow2["vendorNameID"]=origText;
            }
            else {
                tempRow.push("");             // push ""
                tempRow2["vendorNameID"]="";
            }*/
        break;

        case "Contractors"     :
           /* if ( element.id == "cntrctNameID" )  {        // save the origText only if the updated field is the vendor name
                tempRow.push(origText);         // oush the orig company name
                tempRow2["cntrctNameID"]=origText;
            }
            else {
                tempRow.push("");             // push ""
                tempRow2["cntrctNameID"]="";
            }*/
        break;

        case "Scheduler"     :

            tempRow2["employeeID"] = tempRow2["employeeID"] = classArray["Employees"].pNames[tempRow2["Installer"]]; // Set the employee ID;
            tempRow2["is_assigned"] = 0;    // set for Default

            if ( tempRow2['Job Date'] === "") {// no date has been set then set to NULL to adhere to mysql datetime datd type
                tempRow[2] = dummyDate; //formatDateForInput(new Date()); // e.g., '2025-07-10'
                tempRow2['Job Date'] = dummyDate;
            }
            if ( tempRow2["Installer"] != "unassigned" &&
                tempRow2['Job Date'] != dummyDate )  //  get the employeeID from the employeename otherwise set to -1
                tempRow2["is_assigned"] = 1;         // only assign the is_assigned flag if both the date and the installer are set
            const cTime=" "+formatCurrentTime(new Date());
            tempRow2['Job Date'] += cTime;
            tempRow[2] += cTime;
            break;

        default: 
            windowLog.trace("saveRow: error-unknown module"+moduleName+" ignore saving");
            allowSave=false;
        break;
    }
    var ret_value=false;

    if ( allowSave ) {
        /*if ( $("#screen_name").html() != "Home" &&
             $("#screen_name").html() != "Configuration") {
             $("#saveTableLabel").html("Saving...");
             $("#saveTableLabel").show();
        }*/
        $("#saveTableLabel").html("Saving...");
        $("#saveTableLabel").show();

        arrObj["entry1"]=JSON.stringify({"record":tempRow2});   

        $.ajax({             // save the record to the DB
                url         : saveUrl,//"../db/save_record.php",
                type      : "POST",
                data        : {postData:arrObj["entry0"],
                               //headers:headers1,
                               //tableName:headers[moduleName]['tableName'],
                               //record:arrObj["entry3"],
                               record:arrObj["entry1"]},
                dataType    : "json",
                async       : false
        })
        .done(function (data) { 
            if ( lastID[moduleName] < Number(ID) ) 
                lastID[moduleName]++;   // only here increament the ID by 1 after writting to the DB
            ret_value=(Number(data.Status) > 0?true:false);
            //if ( $("#screen_name").html() != "Home" &&
            //     $("#screen_name").html() != "Configuration") {
            var msgColor ='green';
            if ( !ret_value ) {
                $("#saveTableLabel").html("Saving has been failed..");
                msgColor ='red';
            } else
                $("#saveTableLabel").html("Saving has been successfull");
            $("#saveTableLabel").css({'color'     :    msgColor});

            setTimeout(() => $("#saveTableLabel").hide(), 2000); // clear the message after 2 sec
           // }

            windowLog.trace("Saving to DB "+(ret_value?"has been successfull":"failed"));
            DelCounter++;;     // one of Two conditons to allow delete: done saving or any report length > 0
            var entryPntr=-1;
            if ( !isNewRecord )
                entryPntr=classArray[moduleName].retEntrybyID(ID);
            appendRecord(moduleName,tempRow,tempRow2,isNewRecord,entryPntr); // update the corresponding record int he cache 
            if ( projectSet && (fullProjectName != "") ) { // perform the next paragraph only if projectSet is true;
                var prjID=Projects.retEntrybyID(tempRow[1].split("-")[0]); // get the Project Index of the name. the projectID is not neccesarily the Project Index. 
                // in case of a new project, prjid will not be found since it happens in append record that called later. 
                if ( prjID !== -1 && Object.keys(data.length > 1) ) {    // only updste the corresponding fields for a valid prjID and any return value
                    entryNumber=Number(classArray[moduleName].retEntrybyID(Number(ID)));
                    if ( entryNumber >= 0)
                        classArray[moduleName].arr[entryNumber].foldername = contactAllFields;   // update the current foldername with the new one 
                    switch(moduleName) {
                        case "Employee Jobs"    :
                            Projects.arrProjects[prjID].project_total_empl_cost=Number(data.totalLabor);
                        break;

                        case "Payments"         :
                            Projects.arrProjects[prjID].project_total_payments=Number(data.totalPayment);
                        break;

                        case "Sub Contractors"  :
                            Projects.arrProjects[prjID].project_total_cntrc_cost=Number(data.totalCntrc_cost);
                        break;
                        
                        case "Purchases"        :
                            Projects.arrProjects[prjID].project_total_purchases=Number(data.totalPurchases);
                        break;
                    }
                }
                windowLog.trace("project:"+fullProjectName+" PrjID:"+(prjID == -1?"not":prjID)+" found,data length:"+Object.keys(data).length);
            }
            //newRecord=false;
        })
        .fail(function (jqXHR, textStatus, errorThrown) { 
            windowLog.trace(errorThrown); 
        });
    }
    
    return ret_value;      
}

function deleteTask(taskID) {
    
    var retCode=false;

    windowLog.trace("Inside deleteTask(id="+taskID+")");
   
    $.ajax({
        url         : "../db/delete_task.php",
        method      : "POST",
        data        : {postData:taskID},
        async       : false, 
        dataType    : "text",
        success     : function(data) {
            retCode = true;
        },
        error     	: (function (jqxhr, textStatus, error ) {
                    windowLog.trace("Load schedule failed:"+textStatus + ", " + error);})
    });

    return retCode;
}

function saveCustomer(element) {

    var cstmrToSave= {};
    var arrObj=[];
    let saveRet=false;
    const ID=headers["Customers"]['primaryKey']

    const cID = $("#customerTblID").find('[id='+ID+']').text();
    cstmrToSave[ID]=cID;
    cstmrToSave["customer_number"]=Number($("#customerTblID").find("#"+cstrIDtoProperty.customerNumber).val());//Number($("#"+cstrIDtoProperty.customerNumber).val()); 
    
    $("#customerTblID input:gt(0)").each(function() {
        cstmrToSave[this.id] = this.value;
    });
    const cNumber=classArray["Customers"].arr.findIndex(t => t.customer_id == cID);

    cstmrToSave["customer_notes"] = $("#customerTblID").find("#"+cstrIDtoProperty.notesID).val();  // dding notes since it is not part of the main table
    cstmrToSave["customer_state"] = $("#customerTblID").find("#"+cstrIDtoProperty.state+" :selected").val();
   

    arrObj.push(JSON.stringify({cstmrToSave}));
    $.ajax({        // save the record to the DB
        url         : "../db/save_customer.php",
        method      : "POST",
        data      	: {postData:cstmrToSave},
        dataType	: "text",
        async       : false
    }).done(function (data) {      
        const ret_value=(Number(data).Status > 0?true:false);
        windowLog.trace("Saving to DB "+(ret_value === true?"succesfully":"failed"));
        if ( cNumber == -1) {   // existing record
            cstmrToSave["file_uploaded"] = 0;
            cstmrToSave["images_json"] = "";
        }
        appendRecord("Customers",cstmrToSave,""); // update the corresponding record in he cash tempRow2  will be used in the future
        saveRet=true;
        })
        .fail(function (jqXHR, textStatus, errorThrown) { 
            windowLog.trace(errorThrown); 
    });

    return saveRet;l
}

function saveLead(element) {

    var leadtoSave= {};
    var arrObj=[];
    let saveRet=false;
     const ID=headers["Leads"]['primaryKey']

    const rootLead= $(element.closest("div"));

    const lID = rootLead.find('[id='+ID+']').text();
    leadtoSave[ID]=lID;
    //leadtoSave["lead_number"]=Number($("#customerTblID").find("#"+cstrIDtoProperty.customerNumber).val());//Number($("#"+cstrIDtoProperty.customerNumber).val()); 
    
    $(rootLead).find("input").each(function() {
        leadtoSave[this.id] = this.value;
    });

    //leadtoSave[this.id]=$(rootLead).find('[id="allFilesID"]').html()
    const cNumber=classArray["Leads"].arr.findIndex(t => t.lead_id == lID);

    //leadtoSave["customer_notes"] = $("#customerTblID").find("#"+cstrIDtoProperty.notesID).val();  // dding notes since it is not part of the main table
    leadtoSave["lead_state"] = $(rootLead).find('[id=state]').html()
   
    arrObj.push(JSON.stringify({leadtoSave}));

    appendRecord("Leads",leadtoSave,""); // update the corresponding record in he cash tempRow2  will be used in the future
    /*$.ajax({        // save the record to the DB
        url         : "../db/save_customer.php",
        method      : "POST",
        data      	: {postData:leadtoSave},
        dataType	: "text",
        async       : false
    }).done(function (data) {
        const ret_value=(Number(JSON.parse(data).Status)==1?true:false);
        windowLog.trace("Saving to DB "+(ret_value == 1?"succesfully":"failed"));
        appendRecord("Leads",leadtoSave,""); // update the corresponding record in he cash tempRow2  will be used in the future
        saveRet=true;
        })
        .fail(function (jqXHR, textStatus, errorThrown) { 
            windowLog.trace(errorThrown); 
    }); */

    return saveRet;l
}
