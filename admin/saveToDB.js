// save dispatcher  - call save Report for all calls to save except to Scheduler
function save(element,overrideTask) { // overrideTask only used by scheduler

    var saveResult=false;
    
    windowLog.trace("Inside save");
   

    switch ( lastScreen ) {
        case "Scheduler"    :
            /*if ( ( Tasks.intervalEJID == 0 ) &&
                ( Object.keys(Tasks.noneClosedDailyTasks).length > 0 ) ) {
                windowLog.trace("Set the clock to pollingTasks:"+appConfig.tsPolling_Interval*1000*60);
                Tasks.intervalEJID=window.setInterval(function() {
                    refreshReportCallBack();
                }, appConfig.tsPolling_Interval*1000*60);
            } */
            if ( $('#overLay ul li').length === 0 ) // only save the scheduler when the list is off
                saveResult=saveScheduler(element,overrideTask,"notNew");
            break;

        case "Customers"    :
            if ( '#'+$(element).parents('table').eq($(element.target).parents('table').length-1)[0].id == "#LeadsTableWrap" )
                saveResult=saveLead(element);
            else    
                saveResult=saveCustomer(element);
            break;

        default:
            saveResult=saveRow(lastScreen,element);
            if ( element.type != 'time'  && element.type != 'date' )
                setCellFocus();
    }

  
    origText="";
    return saveResult;
}

function sortByyDate(a,b){

}

function appendRecord(module,record,record2,isNewRecord,recordID) {  // record2 will be used i nthe future
    
    windowLog.trace("Inside appendRecord to "+module);

    var taskStatus ="open"; 
   
    switch (module) {

        case "Employee Jobs"    :

            //entryNumber=0;
            var tempeID = -1;
            var seq = 1;
            var inid = 0;
            const employeeName= record[2];
            const taskID = record[0];
            const description=record[9];
            var jc = "";
            var ij = "";

            if ( classArray["Employee Jobs"].arr.length > 0 )  { // if just edit then delete the record follow by adding a new one
                let entryNumber=classArray["Employee Jobs"].retEntrybyID(taskID);
                if ( recordID >= 0 ) { // save the record specific felds
                    jc=classArray["Employee Jobs"].arr[recordID].job_closed;
                    ij=classArray["Employee Jobs"].arr[recordID].images_json;
                    classArray["Employee Jobs"].arr.splice(recordID,1);     // remove the old record 
                }
            }
           
            if ( employeeName != "" )  // if Employee name is nut null than retrieve 
                tempeID=classArray["Employees"].pNames[employeeName];               
            
            classArray["Employee Jobs"].arr.push({
                task_id         :   taskID,
                employee_id     :   tempeID,
                project_number  :   record[1],
                employee_fname  :   employeeName,
                job_date        :   record[3],
                job_signin      :   record[4]+":00", // adding seconds to comply wiht sql date format hh:ss:mm
                lunch_signin    :   record[5]+":00", // adding seconds to comply wiht sql date format hh:ss:mm
                lunch_signout   :   record[6]+":00", // adding seconds to comply wiht sql date format hh:ss:mm
                job_signout     :   record[7]+":00", // adding seconds to comply wiht sql date format hh:ss:mm
                total_hours     :   record[8],
                //gas             :   record[7], // not shopw gas Eyal 04-11
                file_uploaded   :   record[11],
                images_json     :   ij,
                job_closed      :   jc,
                description     :   description,
                labor_cost      :   record[10],
                foldername      :   record[12]
            }); 
  
            let resultT = Tasks.arrTasks.findIndex(t => t.task_id == taskID);
            if ( isNewRecord )  // task exist then delete the record (changes made to the record), follow by adding new one
                Tasks.arrTasks.splice(resultT,1);     // remove the old record 
            else {
                if (( employeeName != "" ) && // look for an existing task to update the seq number
                    ( record[3] != "" ) ) {
                        Tasks.arrTasks.map(function(rec) {
                        if (( rec.employee_name == employeeName) && 
                            rec.task_date.split(" ")[0] == record[3] ) {
                                seqNumber = rec.seq_number;
                                if ( rec.inid != 0) {
                                    const arrayInid=rec.inid.split("-");
                                    inid = arrayInid[0]+"-"+arrayInid[1]+"-"+arrayInid[2]+"-"+(Number(arrayInid[3])+1);    // Increament the inid by 1
                                }
                            }
                        });
                }
            }

            if ( ( record[4] != "" ) && ( record[7] != "" ) )   // if both sign in and signout fields are populated
                taskStatus = "closed";
            else
                if ( record[4] != "" )
                    taskStatus = "signin";

            // add the new task to the schduler
            Tasks.arrTasks.push({
                employee_id       :   tempeID,  // tempID is taken from the employee.pNames array, if employeename is not empty
                employee_name     :   employeeName,
                project_address   :   "",
                project_name      :   record[1],
                project_number    :   record[1].split('-',1)[0],  //projectNumber;,
                task_date         :   record[3],
                task_description  :   description,
                task_id           :   taskID,
                task_status       :   taskStatus,
                inid              :   inid,
                seq               :   seq
            });

            // Gil gil gil change to findindex 
            //let resultT = Tasks.arrTasks.findIndex(t => t.task_id == taskID);
            /*Tasks.arrTasks.map(function(row,index) {
                if ( row.task_id == record[0] ) 
                    entryNumber=index;
            });*/

            // update Task properties
            if ( isNewRecord ) {
            //if (entryNumber != -1) {
                windowLog.trace("Updating new employee name at the tasks table(old):"+Tasks.arrTasks[resultT].employee_name+" new:"+record[2]);
                windowLog.trace("Updating new description at tasks table(old):"+Tasks.arrTasks[resultT].task_description+" new:"+description);
                windowLog.trace("Updating new task date at tasks table(old):"+Tasks.arrTasks[resultT].task_date +" new:"+record[3]+" "+record[4]);
                Tasks.arrTasks[resultT].task_description = description;
                Tasks.arrTasks[resultT].employee_name = record[2]; 
                Tasks.arrTasks[resultT].task_date = record[3]+" "+record[4]+":00";
                Tasks.arrTasks[resultT].employee_id=tempeID;
            }
           
        break;

        case "Purchases"        :

            let entry1=classArray[module].retEntrybyID(record[0]);
            if ( !isNewRecord ) {
                classArray[module].arr[recordID].purchase_id      = record[0];
                classArray[module].arr[recordID].project_number  = record[1];
                classArray[module].arr[recordID].vendor_name     = record[2];
                classArray[module].arr[recordID].purchase_number  = record[3];
                classArray[module].arr[recordID].purchase_amount  = record[4];
                classArray[module].arr[recordID].purchase_date    = record[5];
                classArray[module].arr[recordID].purchase_method  = record[6];
                classArray[module].arr[recordID].description     = record[7];
                classArray[module].arr[recordID].file_uploaded   = record[8];
                classArray[module].arr[recordID].foldername      = record[9];
                //classArray[module].arr.splice(entryNumber,1);     // remove the item then add new/updted record
            }
            else { // record not found then add 
                classArray[module].arr.push({
                    purchase_id      :   record[0],
                    project_number  :   record[1],
                    vendor_name     :   record[2],
                    invoice_number  :   record[3],
                    purchase_amount  :   record[4],
                    invoice_date    :   record[5],
                    payment_method  :   record[6],
                    invoice_desc    :   record[7],
                    file_uploaded   :   record[8],
                    folderrname     :   record[9],
                    images_json     :   ""});
                    
            }
            classArray["Purchases"].arr.sort(function(a,b) {
                return new Date(a.invoice_date) - new Date(b.invoice_date);
              });

        break;

        case "Payments"         :

            const entryN=classArray[module].retEntrybyID(record[0]);
            if ( !isNewRecord ) {
                classArray[module].arr[recordID].payment_id      = record2["payment_id"];
                classArray[module].arr[recordID].project_number  = record2["Project Number"];
                classArray[module].arr[recordID].payment_amount  = record2["Payment Amount"];
                classArray[module].arr[recordID].payment_date    = record2["Payment Date"];
                classArray[module].arr[recordID].payment_method  = record2["Payment Method"];
                classArray[module].arr[recordID].payment_number  = record2["Payment Number"];
                classArray[module].arr[recordID].description     = record2["Description"];
                classArray[module].arr[recordID].file_uploaded   = record2["Files"];
                classArray[module].arr[recordID].foldername      = record2["Folder Name"];
                //classArray[module].arr.splice(entryNumber,1);     // remove the item then add new/updted record          
            }
            else {
                classArray[module].arr.push({
                    payment_id      :   record2["payment_id"],
                    project_number  :   record2["Project Number"],
                    payment_amount  :   record2["Payment Amount"],
                    payment_date    :   record2["Payment Date"],
                    payment_method  :   record2["Payment Method"], 
                    payment_number  :   record2["Payment Number"],
                    description     :   record2["Description"],
                    file_uploaded   :   record2["Files"],
                    foldername      :   record2["Folder Name"],
                    images_json     :   ""
                });
            }
            classArray[module].arr.sort(function(a,b) {
                return new Date(a.payment_date) - new Date(b.payment_date);
              });
        break;

        case "Sub Contractors" :

            var tempeID=-1;
            const entrySC=classArray[module].retEntrybyID(record[0]);

            if ( record[2] != "" )  // if Contractor name is not null
                tempeID=classArray["Contractors"].pNames[record[2]];
            if ( !isNewRecord ) {
                classArray[module].arr[entrySC].task_id         = record[0];
                classArray[module].arr[entrySC].project_number  = record[1];
                classArray[module].arr[entrySC].contractor_name = record[2];
                classArray[module].arr[entrySC].job_date        = record[3];
                classArray[module].arr[entrySC].payment_amount  = record[4];
                classArray[module].arr[entrySC].payment_number  = record[5];
                classArray[module].arr[entrySC].date_paid       = record[6];
                classArray[module].arr[entrySC].description     = record[7];
                classArray[module].arr[entrySC].employee_id     = tempeID;
                classArray[module].arr[entrySC].file_uploaded   = record[8];
                classArray[module].arr[entrySC].foldername      = record[9];
            }
            else {
                classArray[module].arr.push({
                    task_id         :   record[0],
                    project_number  :   record[1],
                    contractor_name :   record[2],
                    job_date        :   record[3],
                    payment_amount  :   record[4],
                    payment_number  :   record[5],
                    date_paid       :   record[6],
                    description     :   record[7],
                    employee_id     :   tempeID,
                    file_uploaded   :   record[8],
                    foldername      :   record[9],
                    images_json     :   ""
                });
            }
            classArray[module].arr.sort(function(a,b) {
                return new Date(a.job_date) - new Date(b.job_date);
              });
        break;    

        case "Employees"        :
                          
            if ( classArray[module].arr.length > 0 ) { // if just edit then delete the record and later add a new one
                 const entryE=classArray[module].retEntrybyID(record[0]);
                if ( !isNewRecord ) {
                    classArray[module].arr.splice(entryE,1);      
                    delete classArray[module].pNames[record[1]];        // remove the item from the pNames array
                    classArray["Employees"].colors[record2["fullname"]]=record2["profile_color"]; // add the color to the colors array
                }
                else
                    classArray["Employees"].colors[record2["fullname"]]=record2["profile_color"]; // add the color to the colors array
            }
            classArray[module].arr.push({
                employee_id     :   record[0],
                username        :   "",
                fullname        :   record[1],
                hourlyrate      :   record[3],
                is_active       :   record[5],
                employment_type :   record[2],
                effective_date  :   record[4],
                password        :   record[6],
                file_uploaded   :   record[7],
                startdate       :   record[8],
                profile_color   :   record2["profile_color"],
                images_json     :   ""
            });
            //classArray[module].arr.sort((firstItem, secondItem) => firstItem.effective_date - secondItem.effective_date);
            classArray[module].pNames[record[1]]=record[0];
            
        break;

        case "Contractors"      :

            const entryC=classArray[module].retEntrybyID(record[0]);
            if ( !isNewRecord ) {
                classArray[module].arr[entryC].contractor_id   =  record[0];      
                classArray[module].arr[entryC].name            =  record[1];
                classArray[module].arr[entryC].notes           =  record[2];
                classArray[module].arr[entryC].file_uploaded   =  record[3];
                delete classArray[module].pNames[record[1]];       // remove the item from the pNames array
            }
            else {
                classArray[module].arr.push({
                    contractor_id   :   record[0],
                    name            :   record[1],
                    notes           :   record[2],
                    file_uploaded   :   record[3],
                    images_json     :   ""
                });
            }
            classArray[module].pNames[record[1]]=record[0];

            windowLog.trace("Updating new contractor name in sub contractor table");
            classArray["Sub Contractors"].arr.forEach(element => {
                if ( element.contractor_name  == record[4]) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                    windowLog.trace("Updating task:"+element.task_id);
                    element.contractor_name = record[1];
                }
            });
        break;

        case "Vendors"          :

            const entryV=classArray[module].retEntrybyID(record[0]);
            if ( !isNewRecord ) {
                classArray[module].arr[entryV].vendor_id       =  record[0];       
                classArray[module].arr[entryV].vendor_name     =  record[1];      
                classArray[module].arr[entryV].vendor_address  =  record[2];      
                classArray[module].arr[entryV].notes           =  record[3];
                classArray[module].arr[entryV].file_uploaded   =  record[4];
                delete classArray[module].pNames[record[1]];        // remove the item from the pNames array
            }
            else {
                classArray[module].arr.push({
                    vendor_id       :   record[0],
                    vendor_name     :   record[1],
                    vendor_address  :   record[2],
                    notes           :   record[3],
                    file_uploaded   :   record[4],
                    images_json     :   ""
                });
            }
            classArray[module].pNames[record[1]]=record[0];

            windowLog.trace("Updating new vendor name in the Purchases(purchases) table");
            classArray["Purchases"].arr.forEach(element => {
                if ( element.vendor_name  == record[5]) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                    windowLog.trace("Updating vendor:"+element.vendor_id);
                    element.vendor_name = record[1];
                }
            });
        break;

        case "Companies"        :

            const entryCM=classArray[module].retEntrybyID(record[0]);
            if ( !isNewRecord ) {
                classArray[module].arr[entryCM].company_id      =  record[0];       
                classArray[module].arr[entryCM].company_name    =  record[1];
                classArray[module].arr[entryCM].notes           =  record[2];
                classArray[module].arr[entryCM].file_uploaded   =  record[3];
                classArray[module].arr[entryCM].images_json     =  record[4];               
                delete classArray[module].pNames[record[1]];    // remove the item from the pNames array        
            }
            else {
                classArray[module].arr.push({
                    company_id      :   record[0],
                    company_name    :   record[1],
                    notes           :   record[2],
                    file_uploaded   :   record[3],
                    images_json     :   "" 
                });
            }
            classArray[module].pNames[record[1]]=record[0];

            windowLog.trace("Updating new project name in the Purchases(purchases) table");
            if ( record[4] != "" ) {
                classArray["Purchases"].arr.forEach(element => {
                    if ( element.project_number.includes(record[4])) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                        windowLog.trace("Updating project name:"+element.project_number);
                        element.project_number=element.project_number.replace(record[4],record[1]);
                    }
                });

                windowLog.trace("Updating new project name in payment table");
                classArray["Payments"].arr.forEach(element => {
                    if ( element.project_number.includes(record[4])) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                        windowLog.trace("Updating project name:"+element.project_number);
                        element.project_number=element.project_number.replace(record[4],record[1]);
                    }
                });

                windowLog.trace("Updating new project name in Sub Contractor table");
                classArray["Sub Contractors"].arr.forEach(element => {
                    if ( element.project_number.includes(record[4])) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                        windowLog.trace("Updating project name:"+element.project_number);
                        element.project_number=element.project_number.replace(record[4],record[1]);
                    }
                });

                windowLog.trace("Updating new project name in employee jobs table");
                classArray["Employee Jobs"].arr.forEach(element => {
                    if ( element.project_number.includes(record[4])) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                        windowLog.trace("Updating project name:"+element.project_number);
                        element.project_number=element.project_number.replace(record[4],record[1]);
                    }
                });
                
                windowLog.trace("Updating new project name in projects table");
                Projects.arrProjects.forEach(element => {
                    if ( element.company_name == record[4] ) {  // entry 4 holds the original contractor name, tempRow[1[] holds the new contractor name]
                        windowLog.trace("Updating project number:"+element.project_number);
                        element.company_name = record[1];
                        element.project_name=element.project_name.replace(record[4],record[1]);
                    }
                });
            }
            
        break;

        case "Hourly Rate"      :  

           const entryHR=classArray["Employees"].retEntrybyID(record[3]);
            if ( !isNewRecord ) 
                classArray["Employees"].arr[entryHR].hourlyrate=record[1]; // update the HR to the latest value
            
        break;

        case "Projects"         :
            // project_number+companyname+customerlastname+project_type+project_manager+project_addre3ss
            const prjName=record[1]+"-"+record[2]+"-"+record[3]+"-"+record[4]+"-"+record[5]+"-"+record[6];  // must change to a function
            const entryP=Projects.retEntrybyID(record[1]); // get the array entry corresponding to the project_number

            if ( !isNewRecord ) { // just to be safe
                const oldPrjName=Projects.arrProjects[entryP].project_name;
                let entryP;
                Tasks.arrTasks.map(function(record,index) {
                    if ( record.project_name == oldPrjName )
                        entryP=index;
                });
                if ( entryP != -1 ) {   // project_name found now update woth the new project name
                    windowLog.trace("Updating new project name at tasks table(old):"+Tasks.arrTasks[entryNumber].project_name+" new:"+prjName);
                    Tasks.arrTasks[entryP].project_name=prjName;
                }

                classArray["Employee Jobs"].arr.map(function(record,index) {
                    if ( record.project_number == oldPrjName ) {
                        classArray["Employee Jobs"].arr[index].project_number = prjName;
                        windowLog.trace("Updating new project name at Employee Jobse(old):"+classArray["Employee Jobs"].arr[index].project_number +" new:"+prjName);
                    }
                });

                classArray["Payments"].arr.map(function(record,index) {
                    if ( record.project_number == oldPrjName ) {
                        classArray["Payments"].arr[index].project_number = prjName;
                        windowLog.trace("Updating new project name at Payments(old):"+classArray["Payments"].arr[index].project_number +" new:"+prjName);
                    }
                });

                classArray["Purchases"].arr.map(function(record,index) {
                    if ( record.project_number == oldPrjName ) {
                        classArray["Purchases"].arr[index].project_number = prjName;
                        windowLog.trace("Updating new project name at Purchases(old):"+classArray["Purchases"].arr[index].project_number +" new:"+prjName);
                    }
                });
 
                const tEntryy=Projects.pNames.indexOf(Projects.arrProjects[entry].project_name); // get the id of the old prj name before override 
                Projects.arrProjects[entryP].project_id              = record[0];
                Projects.arrProjects[entryP].project_number          = record[1];
                Projects.arrProjects[entryP].company_name            = record[2];
                Projects.arrProjects[entryP].project_m_contractor    = record[5];
                Projects.arrProjects[entryP].project_cstmr_lastname  = record[3];
                Projects.arrProjects[entryP].project_type            = record[4];
                Projects.arrProjects[entryP].project_address         = record[6];
                Projects.arrProjects[entryP].project_name            = prjName;  
                Projects.arrProjects[entryP].project_details         = '';
                
                if (tEntryy != -1)
                    Projects.pNames.splice(tEntryy,1);        // remove old entry
                else
                    windowLog.trace(Projects.arrProjects[entry].project_name+" not found in pNames");
            }
             else {
                Projects.arrProjects.push({
                    project_id              :   record[0],         
                    project_number          :   record[1],
                    company_name            :   record[2],
                    project_m_contractor    :   record[5],
                    project_cstmr_lastname  :   record[3],
                    project_type            :   record[4],
                    project_address         :   record[6],
                    project_name            :   prjName,   
                    project_details         :   '',
                    project_total_empl_cost :   '0.00',
                    project_total_cntrc_cost:   '0.00',
                    project_total_purchases :   '0.00',
                    project_total_payments  :   '0.00'
                });
                Projects.length++;
            }
            Projects.pNames.push(prjName);      // add the new project name to the array of names
            
        break; 

        case "Customers"    :

            //let entry=record.customer_number; 
            const entry=classArray["Customers"].arr.findIndex(t => t.customer_id == record.customer_id);
            if ( !isNewRecord ) { // exisitng customer
                classArray[module].arr[entry].customer_first_name=record.customer_first_name;
                classArray[module].arr[entry].customer_last_name=record.customer_last_name;
                classArray[module].arr[entry].customer_address_line1=record.customer_address_line1;
                classArray[module].arr[entry].customer_address_line2=record.customer_address_line2;
                classArray[module].arr[entry].customer_city=record.customer_city;
                classArray[module].arr[entry].customer_state=record.customer_state;
                classArray[module].arr[entry].customer_zip=record.customer_zip;
                classArray[module].arr[entry].customer_email=record.customer_email;
                classArray[module].arr[entry].customer_tel_number=record.customer_tel_number;
                classArray[module].arr[entry].customer_notes=record.customer_notes;
                classArray[module].arr[entry].customer_id=record.customer_id;
                classArray[module].cNames[entry]=buildCstmrSearchString(record);

                const entries = Object.entries(cstrIDtoProperty);
                entries.forEach(([key, value]) => {
                               $(customerRow).find("#"+value).val(record[value]);   // update the corresponding row
                            });
                
                //updateCustomerView(customerRow,entry);    // update the custoemrs view

                /*if ( classArray[module].arr[entry].file_uploaded == "1") // if files already uploaded  than add the new file(s) to the json array
                    windowLog.trace("Adding new file(s) to the library");
                else {
                        windowLog.trace("No previously files uplaoded, update");
                        classArray[module].arr[entry].images_json=record.images_json;
                }*/
                //classArray[module].arr[entry].file_uploaded=record.file_uploaded;
            }
            else {
                classArray[module].arr.push({
                        customer_id:record.customer_id,
                        customer_number:record.customer_number,
                        customer_first_name:record.customer_first_name,
                        customer_last_name:record.customer_last_name,
                        customer_address_line1:record.customer_address_line1,
                        customer_address_line2:record.customer_address_line2,
                        customer_city:record.customer_city,
                        customer_state:record.customer_state,
                        customer_zip:record.customer_zip,
                        customer_email:record.customer_email,
                        customer_tel_number:record.customer_tel_number,
                        customer_notes:record.customer_notes,
                        file_uploaded:record.file_uploaded,
                        images_json:record.images_json
                });
                classArray["Customers"].cNames.push(buildCstmrSearchString(record));    // add the search string to the global list
            }
            break;

            case "Scheduler"    :
                let tEntry=Tasks.arrTasks.findIndex(t => t.task_id == record2["ID"]);
                const cTime=date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();  // current time 
                if ( tEntry === -1 )  { // existing task?
                   
                    Tasks.arrTasks.push({
                            employee_id       :   record2["employeeID"],//classArray['Employees'].pNames[record2["Installer"]],  // empID is taken from the employee.pNames array
                            employee_name     :   record2["Installer"],
                            project_address   :   classArray['Projects'].arrProjects[classArray['Projects'].arrProjects.findIndex(t => t.project_name == record2['prjName'])].project_address,
                            project_name      :   record2['prjName'],
                            project_number    :   record2['prjName'].split('-',1)[0],  //projectNumber;
                            task_date         :   record2['Job Date'],//+" "+cTime, //
                            task_description  :   record2['Description'],  // obtain the text area  textArea=$("#tx"+this.id.slice(2)).val();
                            task_id           :   record2['ID'],
                            task_status       :   'open',
                            inid              :   0,
                            seq               :   1,
                            is_assigned       :   record2["is_assigned"]
                            });
                    tEntry=Tasks.arrTasks.length-1; // add a new entry
                } else {
                    Tasks.arrTasks[tEntry].employee_id = record2["employeeID"];
                    Tasks.arrTasks[tEntry].employee_name = record2["Installer"];
                    Tasks.arrTasks[tEntry].project_address = classArray['Projects'].arrProjects[classArray['Projects'].arrProjects.findIndex(t => t.project_name == record2['prjName'])].project_address;
                    Tasks.arrTasks[tEntry].project_name = record2['prjName'];
                    Tasks.arrTasks[tEntry].project_number = record2['prjName'].split('-',1)[0];
                    Tasks.arrTasks[tEntry].task_date =  record2['Job Date']+" "+cTime;
                    Tasks.arrTasks[tEntry].task_description = record2["Description"];
                    Tasks.arrTasks[tEntry].is_assigned = record2["is_assigned"]; // is employee_id = 0 then makesure is_assigned is 0        
                }
                if ( Number(Tasks.arrTasks[tEntry].is_assigned)) //if assigned then add to the assigned tasks
                    assignedTasksArr.push({    // add the new element to the assigned element
                                employee_id       :   Tasks.arrTasks[tEntry].employee_id,  // empID is taken from the employee.pNames array
                                employee_name     :   Tasks.arrTasks[tEntry].employee_name,
                                project_address   :   Tasks.arrTasks[tEntry].project_address,
                                project_name      :   Tasks.arrTasks[tEntry].project_name,
                                project_number    :   Tasks.arrTasks[tEntry].project_number,  //projectNumber;
                                task_date         :   Tasks.arrTasks[tEntry].task_date,///formatDateForInput(date)+" "+cTime, //Convert the JS date to mySQL date before sending )sqlDate
                                task_description  :   Tasks.arrTasks[tEntry].task_description,  // obtain the text area  textArea=$("#tx"+this.id.slice(2)).val();
                                task_id           :   Tasks.arrTasks[tEntry].task_id, // task_id is the task id of the task that has been assigned
                                task_status       :   Tasks.arrTasks[tEntry].task_status,
                                inid              :   Tasks.arrTasks[tEntry].inid,
                                file_uploaded     :   Tasks.arrTasks[tEntry].file_uploaded,
                                is_assigned       :   "1", // msg.data.assignmentOverride)??
                                seq_number        :   Tasks.arrTasks[tEntry].seq_number});
                        
                else {
                    Tasks.unAssignedCount++; 
                    if ( $("#screen_name").html() == "Scheduler" )  // if unassignedor no job date set then add to the unassigned area
                        addUnassignedTask(Tasks.arrTasks[tEntry]); // add the new task to the scheduler screen
                }
                break;   


            /*case "Leads"    :

                const entryLeads=classArray[module].arr.findIndex(t => t.customer_id == record.customer_id);
                if ( entry != -1) { // exisitng customer
                    classArray[module].arr[entryLeads].customer_first_name=record.customer_first_name;
                    classArray[module].arr[entryLeads].customer_last_name=record.customer_last_name;
                    classArray[module].arr[entryLeads].customer_address_line1=record.customer_address_line1;
                    classArray[module].arr[entryLeads].customer_address_line2=record.customer_address_line2;
                    classArray[module].arr[entryLeads].customer_city=record.customer_city;
                    classArray[module].arr[entryLeads].customer_state=record.customer_state;
                    classArray[module].arr[entryLeads].customer_zip=record.customer_zip;
                    classArray[module].arr[entryLeads].customer_email=record.customer_email;
                    classArray[module].arr[entryLeads].customer_tel_number=record.customer_tel_number;
                    classArray[module].arr[entryLeads].customer_notes=record.customer_notes;
                    classArray[module].arr[entryLeads].customer_id=record.customer_id;
                    classArray[module].cNames[entryLeads]=buildCstmrSearchString(record);

                    const entries = Object.entries(cstrIDtoProperty);
                    entries.forEach(([key, value]) => {
                                $(customerRow).find("#"+value).val(record[value]);   // update the corresponding row
                                });
                }
                else {
                    classArray[module].arr.push({
                            customer_id:record.customer_id,
                            customer_number:record.customer_number,
                            customer_first_name:record.customer_first_name,
                            customer_last_name:record.customer_last_name,
                            customer_address_line1:record.customer_address_line1,
                            customer_address_line2:record.customer_address_line2,
                            customer_city:record.customer_city,
                            customer_state:record.customer_state,
                            customer_zip:record.customer_zip,
                            customer_email:record.customer_email,
                            customer_tel_number:record.customer_tel_number,
                            customer_notes:record.customer_notes,
                            file_uploaded:record.file_uploaded,
                            images_json:record.images_json
                    });
                    //classArray[entryLeads].cNames.push(buildCstmrSearchString(record));    // add the search string to the global list
                }
            break;
            */

           /* case "Estimtes"    :

            //let entry=record.customer_number; 
            const entryEstimate=classArray[module].arr.findIndex(t => t.customer_id == record.customer_id);
            if ( entry != -1) { // exisitng customer
                classArray[module].arr[entryEstimate].estimate_first_name=record.customer_first_name;
                classArray[module].arr[entryEstimate].estimate_last_name=record.customer_last_name;
                classArray[module].arr[entryEstimate].estimate_address_line1=record.customer_address_line1;
                classArray[module].arr[entryEstimate].estimate_address_line2=record.customer_address_line2;
                classArray[module].arr[entryEstimate].estimate_city=record.customer_city;
                classArray[module].arr[entryEstimate].estimate_state=record.customer_state;
                classArray[module].arr[entryEstimate].estimate_zip=record.customer_zip;
                classArray[module].arr[entryEstimate].estimate_email=record.customer_email;
                classArray[module].arr[entryEstimate].estimate_tel_number=record.customer_tel_number;
                classArray[module].arr[entryEstimate].estimate_notes=record.customer_notes;
                classArray[module].arr[entryEstimate].estimate_id=record.customer_id;
                classArray[module].cNames[entryEstimate]=buildCstmrSearchString(record);

                const entries = Object.entries(cstrIDtoProperty);
                entries.forEach(([key, value]) => {
                               $(customerRow).find("#"+value).val(record[value]);   // update the corresponding row
                            });
            }
            else {
                classArray[module].arr.push({
                        estimate_id:record.customer_id,
                        estimate_number:record.customer_number,
                        estimate_first_name:record.customer_first_name,
                        estimate_last_name:record.customer_last_name,
                        estimate_address_line1:record.customer_address_line1,
                        estimate_address_line2:record.customer_address_line2,
                        estimate_city:record.customer_city,
                        estimate_state:record.customer_state,
                        estimate_zip:record.customer_zip,
                        estimate_email:record.customer_email,
                        estimate_tel_number:record.customer_tel_number,
                        estimate_notes:record.customer_notes,
                        file_uploaded:record.file_uploaded,
                        images_json:record.images_json
                });
                }
                //classArray[entryLeads].cNames.push(buildCstmrSearchString(record));    // add the search string to the global list
            break; */


    }
    //newRecord=false;    // reset the flag
}

// event handler of Save and New button
function saveAndNew(elementRec) {

    windowLog.trace("Inside saveAndNew");
    
    let saveResult=saveSingleRec(elementRec);    // Save the record

    let startElement=2;// default startElement, in case of Project, it wil lset to 2
    if ( lastScreen == "Projects" ) {
        startElement=3;
        $('#addSingleRec tr td:nth-child(1)').children()[0].value=Number(Projects.arrProjects[Projects.arrProjects.length-1].project_number)+1; // update the project number in the front end
    }
    resetRecord('#addSingleRec',startElement-1); // reset the record to allow new content, for new Project, skip the Project Number field
    const tID=Number($('#addSingleRec tbody tr td:nth-child(2)').children()[1].value)+1;  // increased the taskID by 1
    $('#addSingleRec tr td:nth-child(2)').children()[1].value=tID; // update the ID

    currCell = $('#addSingleRec tr td:nth-child('+startElement+')').first();    
    currCell.children().first().focus();    // set the focus back to the original field

    return saveResult;
}

function saveSingleRec(recElement) {

    let saveResult=false;
    windowLog.trace("Inside saveSingleRec");

    if ( $("#screen_name").html() === "Scheduler" ) {

        const row=recElement.data.focusedElement.closest('tr')
        var msg=[];
        msg.data=[];
        //msg.target=event;
        msg.data.elementID=recElement.data.focusedElement; //.first().attr('id'); //recElement.data.focusedElement.first()[0];
        msg.data.projectNumber = row.find('[id="prjctNumberID"]').val(); 
        msg.data.taskDate = row.find('[id="unAssgnTskDateID"]').val();
        msg.data.taskID = row.find('[name="taskID"]').val();
        msg.data.name = row.find('[id="activeEmplListID"]').val();
        msg.data.taskDescription = row.find('[id="schdlrDcrptnID"]').val();
        msg.data.name != "unassigned"?msg.data.assignmentOverride=1:msg.data.assignmentOverride=0;
        msg.data.eID = recElement.data.eID;

        const tEntry=Tasks.arrTasks.findIndex(t => t.task_id == msg.data.taskID );
        msg.data.taskIX=tEntry;
        if ( tEntry >= 0 ) {
            if ( Tasks.arrTasks[tEntry].employee_name != msg.data.name || Tasks.arrTasks[tEntry].task_date.split(" ")[0] != msg.data.taskDate ||
                Tasks.arrTasks[tEntry].project_name != msg.data.projectNumber  ||
                Tasks.arrTasks[tEntry].task_description != msg.data.taskDescription ) // if any of the above field changed then update
                saveResult=assignTaskHandler(msg);
            else
                windowLog.trace("No change detected, skip saving");
        } else {
            if ( msg.data.taskDescription != "" || msg.data.projectNumber != "" ) // if any of the above field changed then update
                saveResult=assignTaskHandler(msg);
            else
                windowLog.trace("No change detected, skip saving"); 
        }
    }
    else
        saveResult=saveRow(recElement.data.module,recElement.data.focusedElement,"newRecord"); //$('#addSingleRec tbody tr').closest('[id='+event.data.module+']')[0]

    charactersCount=0;

    return saveResult;
}