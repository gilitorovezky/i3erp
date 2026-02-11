class VirtualScroll {
        constructor(options) {
            this.viewport = document.getElementById('scrollDivID');
            //this.viewport.onscroll=this.updateTable;
            this.viewport.searchBar=document.getElementById('search-bar');
            this.viewport.searchBar.oninput=this.onSearchBarInput;
            this.viewport.scrollTop = 0;
            //this.tableBody = options.tableBody;
            this.renderTarget = document.getElementById('render-target');
            this.spacer = document.getElementById('spacer');
            
            this.filteredData = [];
            this.windowSize = options.windowSize || 50;
            this.rowHeight = options.rowHeight || 10;
            this.visibleRows = options.visibleRows || 40;
            
            this.startIndex = 0;
            this.header="";
            this.footer="";            
            this.filteredData = [...options.inArray];
            this.tableBody = options.tableBody || document.getElementById('tableBody');
            this.throttleTimeout = null;
            this.throttleDelay = options.throttleDelay || 200; // milliseconds
        

        /*setUpScrollEvent() {
            //this.container.addEventListener('scroll', () => this.handleScroll());
        }*/

        // Load all data from server (simulated)
        /*async loadAllData(inArray) {
            // Simulate loading data from PHP/MySQL
            // In real implementation: fetch('api/get_all_records.php')
            
            //this.recordInfo.textContent = 'Loading data...';
            
            // Simulate API delay
            //await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate sample data (replace with actual fetch call)
            //const totalRecords = 1000;
            this.allData = [...inArray]; // Copy it!
            
            /*for (let i = 1; i <= totalRecords; i++) {
                this.allData.push({
                    id: i,
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending',
                    created: new Date(2024, 0, i % 28 + 1).toLocaleDateString()
                });
            }
            
            //this.updateInfo();
        }*/

        /*handleScroll() {
            if (this.isScrolling) return;
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateVisibleRange();
            }, 50);
        }*/

        /*updateVisibleRange() {
            const scrollTop = this.container.scrollTop;
            const containerHeight = this.container.clientHeight;
            
            // Calculate which records should be visible
            const scrollIndex = Math.floor(scrollTop / this.rowHeight);
            const visibleCount = Math.ceil(containerHeight / this.rowHeight);
            
            // Add buffer for smooth scrolling
            const newStart = Math.max(0, scrollIndex - this.buffer);
            const newEnd = Math.min(
                this.allData.length,
                scrollIndex + visibleCount + this.buffer
            );
            
            // Only update if the range changed significantly
            if (newStart !== this.startIndex || newEnd !== this.endIndex) {
                this.startIndex = newStart;
                this.endIndex = newEnd;
                this.updateInfo();
            }
        }*/

            this.init =(inArray) => {

            }

            this.updateTable = () =>{

                if ( this.throttleTimeout === null ) {
                
                    const count = this.filteredData.length;
                    spacer.style.height = (count * this.rowHeight) + "px";
                    
                    const scrollTop = this.viewport.scrollTop;
                    let startIndex = Math.floor(scrollTop / this.rowHeight);
                    
                    // Limit startIndex so we don't go off the end
                    startIndex = Math.min(Math.max(0, startIndex), count - this.visibleRows);
                    let endIndex = Math.min(count, startIndex + this.visibleRows + 5);

                    const paddingTop = startIndex * this.rowHeight;
                    const visibleSlice = this.filteredData.slice(startIndex, endIndex);

                    let html = '';

                    // ONLY add the top spacer if we have actually scrolled down
                    if (startIndex > 0) {
                        const paddingTop = startIndex * this.rowHeight;
                        html += '<tr style="height: ' + paddingTop + 'px;"><td colspan="3" style="border:none; padding:0;"></td></tr>';
                    }

                    html += visibleSlice.join(''); 

                    // BOTTOM SPACER ROW
                    const paddingBottom = Math.max(0, (count - endIndex) * this.rowHeight);
                    if ( paddingBottom > 0 ) {
                        html += '<tr style="height: ' + paddingBottom + 'px;"><td colspan="3" style="border:none; padding:0;"></td></tr>';
                    }
                    windowLog.trace("updte scoll content");
                    this.renderTarget.innerHTML = html;
                        this.throttleTimeout = setTimeout(() => {
                        this.throttleTimeout = null;
                    }, this.throttleDelay);
                }
            }
        }

        attachListener() {
           
            this.viewport.onscroll = () => {
                this.updateTable();
            };
        }

        detachListener() {
            
            this.viewport.removeEventListener('scroll', this.updateTable);
        }


        onSearchBarInput() {
            const term = e.target.value.toLowerCase();
            let searchResultArray=[];
            searchResultArray = classArray["Employee Jobs"].arr.filter(function(item) {
                return item.project_number.toLowerCase().indexOf(term) > -1;
            });
            viewport.scrollTop = 0;
            updateTable(searchResultArray);
        };        

        updateInfo() {
            //const showing = this.endIndex - this.startIndex;
            //this.recordInfo.textContent = 
            //    `Showing ${this.startIndex + 1}-${this.endIndex} of ${this.allData.length} records (Rendering ${showing} rows)`;
        }

        destroy() {
            this.detachListener();
        // Clean up any other resources (timers, etc.)
        }
        /*updateWindowSize() {
            const input = document.getElementById('windowSize');
            const newSize = parseInt(input.value);
            
            if (newSize >= 10 && newSize <= 200) {
                this.windowSize = newSize;
                this.buffer = Math.floor(newSize * 0.2);
                this.updateVisibleRange();
            }
        }*/

        /*scrollToTop() {
            this.container.scrollTop = 0;
            this.startIndex = 0;
            this.endIndex = this.windowSize;
            //this.updateInfo();
        }*/

        /*scrollToBottom() {
            this.container.scrollTop = this.allData.length * this.rowHeight;
            this.updateVisibleRange();
        }*/

        /*scrollToRecord(recordId) {
            const index = this.allData.findIndex(r => r.id === recordId);
            if (index !== -1) {
                this.container.scrollTop = index * this.rowHeight;
                this.updateVisibleRange();
            }
        }*/
}


class classMainMenue {

    hide() {
        if ( !IsTaskInProgress ) {	//  if Task in progress dont hide the signout
            $('#upperRightQuadrant').hide();
        }
        else {
            $('#tHalf').hide();
            $('#upperRightQuadrant').show();
        }
        $('#upperLeft').hide();
    }

    show() {
        $('#upperLeft').show();
        if (username == 'eddie') {
            $('#upperRight').show(); // show/enable the uperright 
            $('#userFileUpload,#fileslabel').hide();
        }
        else {
            if ( IsTaskInProgress ) { // only if task in progress enablesignout and upload files
                $('#tHalf').hide();
                $('#upperRightQuadrant').show();
            }	
        }
    }
};



class classTask	{

    constructor() {
        this.task_id=0;
        this.taskStatus=0;
        this.prjNumber=0;
        this.prjName="";
        this.taskSignInTime=0;
        this.taskSignOutTime=0;
        this.taskLunchSignInTime=0;
        this.taskLunchSignOutTime=0;
        this.description="";
        this.isLunch=false;
        this.jobProgress="";
        this.timer=0;
        this.project_address="";
    }
    
    showDescription() {
        $('#tHalf').removeClass("nextTask");
        $('#tHalf').addClass("taskResult");
        let msg = `Address:<br>`+`<a id="addressNextTask" style="font-size:13px;color:blue;cursor:pointer">${this.project_address} </a><br>`;
        msg += `Description:<br>`+this.description;
        $('#tHalf').html(msg);
    }

    upperleftMsg(msg) {
        //$("#tHalf").unbind("click");
        $('#tHalf').html("Are you sure you want to "+msg+"<br><br><input type='button' class='button boxShadow' value='Yes' id='yesBtn'/>&nbsp<input type='button' class='button boxShadow' value='No' id='noBtn'/>");
    }

    open() {
        this.upperleftMsg("Sign In");
    }

    signin() {
        this.upperleftMsg("Start Lunch?");
    }

    lunchin() {
        this.upperleftMsg("Lunch Out");
    }

    lunchout() {
        this.upperleftMsg("");        
    }

    reset() {
        this.task_id=0;
        this.taskStatus=0;
        this.prjNumber=0;
        this.taskSignInTime=0;
        this.taskSignOutTime=0;
        this.taskLunchSignInTime=0;
        this.taskLunchSignOutTime=0;
        this.description="";
        this.isLunch=false;
        this.jobProgress="";
        this.timer=0;
    }
}

var currentWorkingTask = new classTask;

class classConfig {

    constructor() {
        this.ntPolling_Interval=1;	// default employee new Task polling interval in minute
        this.tsPolling_Interval=1;	// default taskStatus polling interval in monute
    }
    
    initGlobalSettings(arrConfig) { // 1 - system parms, 2 - last modified file
        //this.root_projects=arrConfig[1].root_projects;
        //this.gas_dir=arrConfig[1].gas_dir;
        //this.receipts_dir=arrConfig[1].receipts_dir;
        const ntInterval=Number(arrConfig[1].newTask_polling_interval);
        const fldrs=JSON.parse(arrConfig['fldrs']['folders']);
        this.db_version= arrConfig[1].db_version;
        this.maxUploadFileSize=arrConfig[1].maxUploadFileSize;
        
        $("#footer").text(arrConfig[1].app_version); // updating the footer value
        if (  ntInterval >= 0 && ntInterval <= 10 ) {
            windowLog.trace("new Task polling Interval(min):"+ntInterval);
            this.ntPolling_Interval=ntInterval; 
        }
        else 
            windowLog.trace("Set new Task polling Interval(min) to default:"+this.ntPolling_Interval);

        const tsInterval=Number(arrConfig[1].taskStatus_polling_interval);
        if (  tsInterval >= 0 && tsInterval <= 10 ) {
            windowLog.trace("taskStatus polling Interval(min):"+tsInterval);
            this.tsPolling_Interval=tsInterval; 
        }
        else 
            windowLog.trace("Set new Task polling Interval(min) to default:"+this.tsPolling_Interval);
        this.lastMdfyFile=arrConfig[2].filename;
        this.lastMdfyDate=arrConfig[2].lastMdfyDate;
        this.loginPollingInterval=Number(arrConfig[1].logins_polling_interval);
        
        this.root=fldrs.system.root_library;
        this.root_projects=this.root+fldrs.system.root_projects;
        this.docket_dir=this.root+fldrs.system.root_docket;
        this.gas_dir=this.root_projects+fldrs.system.gas_receipts;
        this.receipts_dir=this.root_projects+fldrs.system.general_receipts;
        this.archive_dir=this.root+fldrs.system.archive;// archieve folder for "deleted files"
        this.config_dir=this.root+fldrs.system.root_config;// config directory
        this.customers_dir=this.root+fldrs.system.customers;
        this.leads_dir=this.root+fldrs.system.leads;
        this.estimates_dir=this.root+fldrs.system.estimates;
        this.maxUAtasksInRow=arrConfig[1].maxUAtasksInRow;
        this.maxUArows=arrConfig[1].maxUArows;
        this.masterModuleAttributes=JSON.parse(arrConfig[1].masterModuleAttributes);
        this.newEntryMaxDepth=arrConfig[1].new_entry_max_depth;
        this.saveMsgTimeout=Number(arrConfig[1].saveMsgTimeout);
        this.fastLoading=arrConfig[1].fast_loading==='1'?true:false;
        //this.defaultProfileColor=arrConfig[1].default_profile_color;
    }
}

var appConfig = new classConfig;

// genesis class, holds all the common informaton for the child classes
class genesisClass {
    constructor(inArray,moduleName,screen) {

        this.arr=[];		// General array to hold the results from the DB
        this.moduleName = moduleName;
        this.screenNumber=screen;
        if ( (Object.keys(inArray).length > 0) && (Number(inArray[0].Status) > 0) )
            lastID[moduleName]=Number(inArray[0].maxID);

        if (Object.keys(inArray).length > 1) { 		// GT 1 since there will be always 1 entry for the retrn result
            windowLog.trace("Initializing "+moduleName+"...");
            Object.keys(inArray).forEach( (key) => { //copy the return data from the DB into the class array
                this.arr.push(inArray[key]);
            } );
            this.arr.splice(0,1); // delete the 0 entry before copying the inout array to the class	
        }
        else
            windowLog.trace(this.moduleName+"- Empty table!");

        /*this.virtualScroll = new VirtualScroll({
            container: document.getElementById('scrollDivID'), //scrollContainer'),
           
            //spacerTop: document.getElementById('spacerTop'),
            //spacerBottom: document.getElementById('spacerBottom'),
            //recordInfo: document.getElementById('recordInfo'),
            windowSize: 50,
            buffer: 10,
            rowHeight: 45
        });*/

    }


    moduleName() {
        return 'screenName ' + this.moduleName;
    }
    
    showType() {
        return this.type;
    }

    initNames() {

    }

    // return the arr entry number of a given index (task_id, contrctor_id ...)
    retEntrybyID(item) {

        var entry=-1;
        var i=0;
        var found = false;
        const key=headers[this.moduleName].primaryKey;
        while ( ( i < this.arr.length) && (!found) ) {
            if  ( this.arr[i][key] === item ) {
                found = true; 	// exit the while gracefully
                entry = i;
            }
            i++;
        }


        return entry;
    } 
};

class classTasks extends genesisClass {

    constructor(inArray) {

        
        super(inArray,"Scheduler",1);	// call the parent constructor

        this.arrTasks=[];
        windowLog.trace("Inside classTasks constructor");
        this.noneClosedDailyTasks=[];
        this.intervalEJID=0;
        this.nextTaskID=1;
        this.newTask=0;						// hold the newest task
        this.unAssignedCount=0;
       
        //this.arrTasks.splice(0,1); 
        if (Object.keys(inArray).length > 1) {
            this.nextTaskID=Number(inArray[0].maxID);
            delete inArray[0];
            Object.keys(inArray).forEach( (key) => { //copy the return data from the DB into the class array
                if ( inArray[key].employee_id == 0 || Number(inArray[key].is_assigned) == 0 ) 
                    this.unAssignedCount++;
                this.arrTasks.push(inArray[key]);
                const tToday = new Date();
                const today=formatDateForInput(tToday); // convert to yyyy-mm-dd

                if ( (inArray[key].task_status != 'closed') && ( inArray[key].task_date.split(' ')[0] == today) ) {
                    this.noneClosedDailyTasks[inArray[key].task_id+"-"]=inArray[key].task_status;	// add new entry, adding - to make the arra yassociative for faster search later
                    windowLog.trace("Adding nonClosed task:"+inArray[key].task_id);
                }
                
            } );
        }
        //this.arrTasks.splice(0,1); // delete the 0 entry before copying the inout array to the class	
        /*this.arrTasks.forEach(element => { 
            if ( (element.task_status != 'closed') && ( element.task_date.split(' ')[0] == today) ) {
                this.noneClosedDailyTasks[element.task_id+"-"]=element.task_status;	// add new entry, adding - to make the arra yassociative for faster search later
                windowLog.trace("Adding nonClosed task:"+element.task_id);
            }
        });*/
    }
    
    toJSON = function(tenpO) {
        var sobj = {}, i;
        for (i in tenpO) {
            const j=i.slice(0,-1); // remove the - at the end from the task_id before sending the array to php
        if (tenpO.hasOwnProperty(i))
            sobj[j] = typeof tenpO[i] == 'function' ?
            tenpO[i].toString() : tenpO[i];
        }
        return sobj;
    };

    refreshTasks() {
        windowLog.trace("Refresh tasks");
    }
};

class classProjects extends genesisClass {

    static pNames = [];
    static prjTotalCosts=0.0;
    static totalPurchases=0.0;
    static totalEmployeeCost=0.0;
    static totalContractorCost;
    static totalBalance=0.0; 		
    static projectNumber;
    static projectName;
    static details;
    static totalPayments=0.0;

    constructor(pList) {

        super(pList,"Projects",1);	// call the parent constructor

       
        this.arrProjects=pList;
        this.maxID;
        this.pNames=[];
        this.length = this.arrProjects.length;
        for (var i = 0; i < this.length; i++)  //loop throu the return msg 
            this.pNames.push(this.arrProjects[i].project_name);
    } 

    retEntrybyID(ID) {

        var entry=-1;
        var i=0;
        var found = false;
        while ( ( i < this.arrProjects.length) && (!found) ) {
            if  ( this.arrProjects[i].project_id === ID ) {
                found = true; 	// exit the while gracefully
                entry = i;
            }
            i++;
        }
        return entry;
    } 

    element(i) { // for testing
        return this.arrProjects[i].project_details;
    }	

    setprojectNumber(pID) {
        Projects.projectNumber=this.arrProjects[pID].project_number;
    }

    getprojectNumber() {
        return Projects.projectNumber;
    }

    getEmployeeCost(i) {
        Projects.totalEmployeeCost=+(this.arrProjects[i].project_total_empl_cost);
        return Projects.totalEmployeeCost.toFixed(2);	
    }

    getContractorCost(i) {
        Projects.totalContractorCost=+(this.arrProjects[i].project_total_cntrc_cost);
        return Projects.totalContractorCost.toFixed(2); 
    }

    getTotalPurchases(i) {
        return (Projects.totalPurchases=+(this.arrProjects[i].project_total_purchases)).toFixed(2); 
    }
        
    getPrjTotalCosts()	{ // sum of all costs : employees labor+contractors work and purchases
        Projects.prjTotalCosts=Projects.totalEmployeeCost+Projects.totalContractorCost+Projects.totalPurchases;
        return Projects.prjTotalCosts.toFixed(2); 
    }

    getTotalBalance()	{
        return (Projects.totalBalance=Projects.totalPayments-Projects.prjTotalCosts).toFixed(2);
    }

    getDetails(i) {
        return this.arrProjects[i].project_details;
    }

    getAddress(i) {
        return this.arrProjects[i].project_address;
    }

    getPrjName(i) {
        return this.arrProjects[i].project_name;
        //Projects.pNames[i];
    }

    setTotalPayments(i) {
        return (Projects.totalPayments = +this.arrProjects[i].project_total_payments);
    }
}

// Class type1 for the home screen
class classType1 extends genesisClass {

    constructor(inputArray,moduleName,screenNumber) {
        super(inputArray,moduleName,screenNumber);	// call the parent constructor
        this.pNames=[];		// only names for the contexcual search		
    }
};

// Class type2 for configuration screen
class classType2 extends genesisClass {

    constructor(inputArray,moduleName,screenNumber) {
        super(inputArray,moduleName,screenNumber);	// call the parent constructor
        this.ID=[];			// Only be used by Employees and Contractors
        this.pNames=[];		// only names for the contexcual search		
    }
};

const classMap = {
  1: classType1,
  2: classType2
};
