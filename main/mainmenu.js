var date = new Date();

let windowLog = new Log4js.getLogger("windowTest"); 

var editing = false;    // global flag to indicate if any valid char was typed
var active = 0;
var screenNumber="home";	
var username;
var fullname;
var uid;
var eID;
let files2show=""; 	// global variable to hold the list of images to pass to the caroussel
var deletedRow2=[];	// temp array to save the cell content
var deleteOnce=false;
var classArray=[];
let isZoom = false;
var today=date.getFullYear()+"-"+(("0" + (date.getMonth()+1)).slice(-2))+"-"+(("0"+date.getDate()).slice(-2)); 

const dummyDate= "1999-01-01"
const customerPanes=["Leads","Estimates","Projects"];

const screens=["",home,configuration];

const modules = ["Employee Jobs","Purchases","Payments","Sub Contractors","Vendors",
                 "Companies","Contractors","Employees","Projects","Customers","Estimates","Scheduler","Hourly Rate"];

const captions = {
        "genesis":["upperLeft","upperRight","lowerLeft","lowerRight"], // do not change - must match the id in the html ome@ h!!
        "shortcuts":["ul","ur","ll","lr"], // shortcuts menue
        "home":["Employee Jobs","Purchases","Payments","Sub Contractors","Projects","Scheduler","Customers","Estimates","Leads"], // main menu 
        "config":["Employees","Vendors","Contractors","Companies"],	// Configuration menue 
        "user":["Sign In","Sign Out","Gas","Upload Files"],	    // User main menue
        "handlers":[upperLeft,upperRight,lowerLeft,lowerRight]} // handlers functions


// only the first 4 do not include thead and <th></th> since these records are also showing in the project summary therefor no need delete 
const headers = {
    "Home":{hash:'home',callBack:home,tableName:'home',sn:1},
    "Employee Jobs":{hash:'empljbs',callBack:upperLeft,callType:"generalUpload",sn:"home",columns:'<th style="width:4%">Full Name</th><th>Job Date</th><th style="width:4%">Job SignIn</th><th style="width:4%">Lunch SignIn</th><th>Lunch SignOut</th><th>Job SignOut</th><th>Total Hours</th><th style="width:15%">Description</th><th style="width:2%">Total cost</th><th style="width:100px">Files</th>',numOfCols:12,showInPrj:true,primaryKey:'task_id',tableName:'employee_jobs',params:0},
    "Purchases":{hash:'prchs',callBack:upperRight,callType:"generalUpload",sn:"home",columns:'<th>Vendor</th><th>Invoice Number</th><th>Invoice Amount</th><th>Invoice Date</th><th>Payment Method</th><th>Description</th><th style="width:100px">Files</th>',numOfCols:9,showInPrj:true,primaryKey:'invoice_id',tableName:'purchases',params:0},
    "Payments":{hash:'pymnts',callBack:lowerLeft,callType:"generalUpload",sn:"home",columns:'<th>Payment Amount</th><th>Payment Date</th><th>Payment Method</th><th>Payment Number</th><th>Description</th><th style="width:100px">Files</th>',numOfCols:9,showInPrj:true,primaryKey:'payment_id',tableName:'payments',params:0},
    "Sub Contractors":{hash:'sbcntrcj',callBack:lowerRight,callType:"generalUpload",sn:"home",columns:'<th>Contractor Name</th><th>Job Date</th><th>Payment Amount</th><th>Check number</th><th>Date paid</th><th>Description</th><th style="width:100px">Files</th>',numOfCols:9,showInPrj:true,primaryKey:'task_id',tableName:'contractor_jobs',params:0},
    "Projects":{hash:'dprjct',callBack:projects,callType:"generalUpload",sn:"aux",columns:'<thead class="mainHeaderClass" id="mainHeader"><th></th><th>Project Number</th><th>Company Name</th><th>Customer Last Name</th><th>Project Type</th><th>Project Manager/Rep</th><th>Project Address</th><th style="width:100px">Files</th></tr></thead>',numOfCols:8,showInPrj:false,primaryKey:'project_id',tableName:'projects',params:0},
    "Scheduler":{hash:'schdlr',callBack:scheduler,callType:"schedulerUpload",columns:'<th style="width:5%">Job Date</th><th style="width:15%">Description</th><th>Installer</th><th>Files</th></tr></thead>',numOfCols:6,showInPrj:true,primaryKey:'task_id',tableName:'task_list',sn:"home",params:0}, // sn=screennumber
    "Vendors":{hash:'vndrs',callBack:upperRight,callType:"generalUpload",sn:"config",columns:'<th>Vendor Name</th><th>Vendor Address</th><th>Notes</th><th style="width:100px">Files</th>',numOfCols:5,showInPrj:false,primaryKey:'vendor_id',tableName:'vendors',params:0},
    "Companies":{hash:'dcmpny',callBack:lowerRight,callType:"generalUpload",sn:"config",columns:'<th>Company Name</th><th>Notes</th><th style="width:100px">Files</th>',numOfCols:4,showInPrj:false,primaryKey:'company_id',tableName:'companies',params:0},
    "Contractors":{hash:'dc',callBack:lowerLeft,callType:"generalUpload",sn:"config",columns:'<th>Contractor Name</th><th>Notes</th><th style="width:100px">Files</th>',numOfCols:4,showInPrj:false,primaryKey:'contractor_id',tableName:'contractors',params:0},
    "Employees":{hash:'emplyees',callBack:manageEmployees,callType:"generalUpload",sn:"config",columns:'<th>Full Name</th><th>Employment Type</th><th>Hourly Rate</th><th>Hourly Rate Date</th><th>Is Active</th><th>Password</th><th style="width:100px">Files</th>',numOfCols:8,showInPrj:false,primaryKey:'employee_id',tableName:'employees',params:"#result-table1"},
    "Hourly Rate":{hash:'hr-rate',callBack:showHR,callType:"generalUpload",sn:"config",columns:'<th>Hourly Rate</th><th>Hourly Rate Date</th>',numOfCols:3,showInPrj:false,primaryKey:'hr_id',tableName:'hourlyrate_history',params:0},
    "Configuration":{hash:'config',callBack:configuration,callType:"",tableName:'',sn:"config",params:0},
    "Gallery":{hash:'gallery',callBack:gallery,tableName:'',callType:"galleryUpload",sn:"config",params:0},
    "Customers":{hash:'customers',callBack:customers,callType:"uploadCstmrFile",sn:"config",columns:'<thead class="mainHeaderClass" id="mainHeader"><th></th><th style="width:100px">Customer ID</th><th style="width:100px">First Name</th><th style="width:200px">Last Name</th><th style="width:120px">Tel number</th><th>email</th></th><th>Address line1</th><th style="width:100px">Address line 2</th><th style="width:150px">City</th><th style="width:40px">State</th><th style="width:60px">Zip</th><th style="width:25%">Notes</th><th style="width:100px">Files</th></thead>',numOfCols:7,showInPrj:false,primaryKey:'customer_id',tableName:'customers',params:0},
    "Leads":{hash:'leads',callBack:leads,callType:"generalUpload",sn:"aux",columns:'<thead class="mainHeaderClass" id="mainHeader"><th style="width:80px">Lead Number</th><th>Date</th><th>Time</th><th style="width:80px">First Name</th><th style="width:200px">Last Name</th><th style="width:100px">Tel number</th><th>email</th><th style="width:100px">Assign to</th></th><th>Address line1</th><th style="width:50px">Address line 2</th><th style="width:150px">City</th><th style="width:40px">State</th><th style="width:80px">Zip</th><th style="width:100px">Files</th></thead>',numOfCols:4,showInPrj:false,primaryKey:'lead_id',tableName:'leads',params:0},
    "Estimates":{hash:'estimates',callBack:estimate,callType:"generalUpload",sn:"config",columns:'<thead class="mainHeaderClass" id="mainHeader"><th>Estimate Number</th><th>Company Name</th><th>Customer Last Name</th><th>Project Type</th><th>Project Manager/Rep</th><th>Address</th><th style="width:100px">Files</th></thead>',numOfCols:7,showInPrj:false,primaryKey:'estimate_id',tableName:'estimates',params:0}
};

const defaultState={ name: "Califorina", abbreviation: "CA" };

const states = [
            { name: "Alabama", abbreviation: "AL" },
            { name: "Alabama", abbreviation: "AL"},
            { name: "Alaska", abbreviation: "AK"},
            { name: "Arizona", abbreviation: "AZ"},
            { name: "Arkansas", abbreviation: "AR"},
            { name: defaultState.name, abbreviation: defaultState.abbreviation},
            { name: "Colorado", abbreviation: "CO"},
            { name: "Connecticut", abbreviation: "CT"},
            { name: "Delaware", abbreviation: "DE"},
            { name: "District of Columbia", abbreviation: "DC"},
            { name: "Florida", abbreviation: "FL"},
            { name: "Georgia", abbreviation: "GA"},
            { name: "Hawaii", abbreviation: "HI"},
            { name: "Idaho", abbreviation: "ID"},
            { name: "Illinois", abbreviation: "IL"},
            { name: "Indiana", abbreviation: "IN"},
            { name: "Iowa", abbreviation: "IA"},
            { name: "Kansas", abbreviation: "KS"},
            { name: "Kentucky", abbreviation: "KY"},
            { name: "Louisiana", abbreviation: "LA"},
            { name: "Maine", abbreviation: "ME"},
            { name: "Maryland", abbreviation: "MD"},
            { name: "Massachusetts", abbreviation: "MA"},
            { name: "Michigan", abbreviation: "MI"},
            { name: "Minnesota", abbreviation: "MN"},
            { name: "Mississippi", abbreviation: "MS"},
            { name: "Missouri", abbreviation: "MO"},
            { name: "Montana", abbreviation: "MT"},
            { name: "Nebraska", abbreviation: "NE"},
            { name: "Nevada", abbreviation: "NV"},
            { name: "New Hampshire", abbreviation: "NH"},
            { name: "New Jersey", abbreviation: "NJ"},
            { name: "New Mexico", abbreviation: "NM"},
            { name: "New York", abbreviation: "NY"},
            { name: "North Carolina", abbreviation: "NC"},
            { name: "North Dakota", abbreviation: "ND"},
            { name: "Ohio", abbreviation: "OH"},
            { name: "Oklahoma", abbreviation: "OK"},
            { name: "Oregon", abbreviation: "OR"},
            { name: "Pennsylvania", abbreviation: "PA"},
            { name: "Rhode Island", abbreviation: "RI"},
            { name: "South Carolina", abbreviation: "SC"},
            { name: "South Dakota", abbreviation: "SD"},
            { name: "Tennessee", abbreviation: "TN"},
            { name: "Texas", abbreviation: "TX"},
            { name: "Utah", abbreviation: "UT"},
            { name: "Vermont", abbreviation: "VT"},
            { name: "Virginia", abbreviation: "VA"},
            { name: "Washington", abbreviation: "WA"},
            { name: "West Virginia", abbreviation: "WV"},
            { name: "Wisconsin", abbreviation: "WI"},
            { name: "Wyoming", abbreviation: "WY"}
        ];


/*let bgColor = [];
bgColor["jake"] =   "rgb(231 237 7 / 33%)";
bgColor["pedro"]=   "rgb(49 200 247 / 25%)";
bgColor["orel"] =   "rgb(153, 226, 210)";*/

var lastID=[];
modules.forEach( (record) => {
        lastID[record]=1; // init lastID with default value (1)
    }); 

let arrClasses=[];	// holds the classes
let intervalEJID=0;
let intervalCJID=0;
let lastScreen="Home";  // Holds the last visiting Screen, for now it is for Scheduler
let subScreen="";       // hold the new rec type from home screen, like projects, pyments etc.. used to identify the record type for the contextual search
const initialProjectNumber=1000;
const initialCstmrNumber=1;



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

const taskState =["open","signin","signout","lunchin","lunchout","closed"];

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
        $('#tHalf').html("Are you sure you want to "+msg+"<br><br><input type='button' class='button boxShadow' value='Yes' id='btnYes'/>&nbsp<input type='button' class='button boxShadow' value='No' id='btnNo'/>");
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
            windowLog.trace("Initialzing "+moduleName+"...");
            Object.keys(inArray).forEach( (key) => { //copy the return data from the DB into the class array
                this.arr.push(inArray[key]);
            } );
            this.arr.splice(0,1); // delete the 0 entry before copying the inout array to the class	
        }
        else
            windowLog.trace(this.moduleName+"- Empty table!");
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
            if  ( this.arr[i][key] == item ) {
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
            if  ( this.arrProjects[i].project_id == ID ) {
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

MainMenue = new classMainMenue;

var pageAccessedByReload = (
    (window.performance && window.performance === 1) ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload')
  );

// .load() method deprecated from jQuery 1.8 onward
$(window).on("load", function() {

    windowLog.trace("Insdie window onload");
 
});

window.addEventListener("load", function() {

    windowLog.trace("event listner load");
    username=Cookies.get('username');
    fullname = username;
    $("#overLay ul").attr('data-module',"");
    $("#welcomeNameID").html("Welcome Back, "+username);
    //$("#saveTableLabel").hide();
    if ( typeof username != "undefined" ) {
        uid=Cookies.get('uid');

        $.ajax({url     : "../main/read_config.php",
            method		: "GET",
            dataType	: "json",
            async       : false,  
            success		: function(data) {  
              if ( ( data != '' ) && 
                    ( Number(data[0].Status) > 0 ) )
                    initConfig(data);
                else {
                    windowLog.warn("error loading configurtions, exit");
                    logout();
                }
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.trace("Load schedule failed:"+textStatus + ", " + error);
                logout();})
        });

        $.ajax({url         : "../main/read_employees.php",
                method		: "POST",
                data      	: {calltype:username},
                dataType	: "json",
                async       : false,  
                success		: function(data) {  
                    if ( ( data != '' ) && 
                         ( Number(data[0].Status) > 0 ) ) {
                        eID = data[0].employee_id;
                        windowLog.trace("username:"+username+" eID:"+eID);
                        if ( ( eID == '')  || 
                              ( typeof eID == "undefined" ) )// major error
                            logout();
                    }
                    else {
                        windowLog.trace("error loading employee_id, exit");
                        logout();
                    }
                },
                error     	: (function (jqxhr, textStatus, error ) {
                    windowLog.trace("Load schedule failed:"+textStatus + ", " + error);
                    logout();
                })
        });
    }
    else { 
        console.log("Error- username undefined, exit");
        logout();
    }
    
    if ( pageAccessedByReload == true ) {

        //username=Cookies.get('username');
        windowLog.trace("screen name:"+window.location.hash);
        switch (window.location.hash) {
            case "#ej"      :
            //displayEmployeeJobResults(0,"#result-table1") ;// 0 indicate all records to show
            break;

            case "#home"    :
                MainMenue.show();
                //$("#centercellID").show();
                $("#centercellID").visible();

                /*if (username == 'eddie') 
                    screenNumber="home";
                else
                    screenNumber="engineer";*/
             
            break;    
        }
    }
    screenNumber = window.location.hash.slice(1);
    displayMainMenue(window.location.hash.slice(1));

    $(".main_menue").show();
    if (username == 'eddie')
        $("#prjShortCut").focus();

     $("body").delegate("#projectLbl1,#customersLbl2","contextmenu",function() {
        if (event.target.tagName === "LABEL") {
            event.preventDefault();
            floatingMessage.style.left = event.pageX+'px';
            floatingMessage.style.top = event.pageY+'px';
            floatingMessage.innerHTML="<p class='label1'>Right click "+event.target.innerText+"</p>";
            floatingMessage.style.display = 'block';
            setTimeout(function() {
                floatingMessage.style.display = 'none';
            }, 1000); // Hide after 2 seconds
        }
     });


   $(".css-3d-text").on('contextmenu', function(event) {
        if (event.target.tagName === "A") {
            event.preventDefault();
            floatingMessage.style.left = event.pageX+'px';
            floatingMessage.style.top = event.pageY+'px';
            floatingMessage.innerHTML="<p class='label1'>Right click "+event.target.innerText+"</p>";
            floatingMessage.style.display = 'block';
            setTimeout(function() {
                floatingMessage.style.display = 'none';
            }, 1000); // Hide after 2 seconds
        }
    });

});

(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));


let assignedTasksArr;   // global array that holds all assgined tasks

$(document).ready( function() {

    windowLog.trace("Inside document ready");

    $("#logout").html("Logout");
    //$('#logout').css({'cursor'   : 	'pointer'});
    username=Cookies.get('username');
    if (typeof username == "undefined" ) {
        console.log("Error- username undefined, exit");
        logout();
    }
    if (username === 'eddie') { //only Eddie could access

        $("#configID").html("Configuration");
        $("#systemID").html("System");
        $("#rootID").html("Home");
        $("#libraryID").html("Library");
        $('#welcomeNameID,#rootID,#configID,#libraryID,#systemID,#logout').css({'cursor':'pointer'});
    
        let formData = new FormData();
        formData.append('projectNumber', "all");
        fetch("../main/read_payments.php",{ method	: "POST", 
                                            body    : formData })
            .then(res 	    => res.json())
            .then((data)    => {
                classArray["Payments"]= new classType1(data,"Payments",1)
                windowLog.trace("Load all Payments completed succesfully("+(classArray["Payments"].arr.length)+")");
            })
            .catch(error    => { 
                windowLog.warn('Error: 1', error);
                logout();}); 
       
        fetch("../main/read_purchases.php",{method   : "POST",
                                            body     : formData})
            .then(res 	 => res.json())
            .then((data) => {
                classArray["Purchases"] = new classType1(data,"Purchases",1)
                windowLog.trace("Load all Purchases completed succesfully("+(classArray["Purchases"].arr.length)+")");
            }) 
            .catch(error => { alert(error);
                windowLog.warn('Error: 2', error);
                logout();
            }
        );
        
        fetch("../main/read_contractor_jobs.php",{method 	 	: "POST", 
                                                  body		    : formData })
            .then(res    => res.json())
            .then((data) =>  {
                classArray["Sub Contractors"] = new classType1(data,"Sub Contractors",1)
                windowLog.trace("Load all Sub Contractors completed succesfully("+(classArray["Sub Contractors"].arr.length)+")");
            })
            .catch(error => {
                windowLog.warn('Error: 3', error);
                logout();
            }
        );
        
        fetch("../main/read_companies.php")
            .then(res 	  => res.json())
            .then((data)  => { 
                classArray["Companies"] = new classType2(data,"Companies",2);
                classArray["Companies"].arr.forEach( (key) => { //copy the return data from the DB into the class array
                    classArray["Companies"].pNames[key.company_name]=key.company_id;
                })
                windowLog.trace("Load all Companies completed succesfully("+(classArray["Companies"].arr.length)+")");
            })
            .catch(error => { 
                windowLog.warn('Error: 4', error);
                logout();
            }
        );

        fetch("../main/read_contractors.php")
            .then(res 	  => res.json())
            .then((data)  => { 
                classArray["Contractors"] = new classType2(data,"Contractors",2); 
                classArray["Contractors"].arr.forEach( (key) => { //copy the return data from the DB into the class array
                        classArray["Contractors"].pNames[key.name.toString()]=key.contractor_id; 
                })
                windowLog.trace("Load all Contractors completed succesfully("+(classArray["Contractors"].arr.length)+")");
            })
            .catch(error => { 
                windowLog.warn('Error: 5', error);
                logout();
            }
        );

        fetch("../main/read_vendors.php")
            .then(res 	  => res.json())
            .then((data)  => { 
                classArray["Vendors"] = new classType2(data,"Vendors",2); 
                classArray["Vendors"].arr.forEach( (key) => { //copy the return data from the DB into the class array
                    classArray["Vendors"].pNames[key.vendor_name]=key.vendor_id;
                })
                 windowLog.trace("Load all Vendors completed succesfully("+(classArray["Vendors"].arr.length)+")");
            })
            .catch(error => { 
                windowLog.warn('Error: 6', error);
                logout(); 
            }
        );

        $.ajax({url         : "../main/read_employees.php",
                method		: "POST",
                data      	: {calltype:`all`},
                dataType	: "json",
                async       : false,  
                success		: function(data) {  
                    if ( ( data != '' ) && 
                         ( Number(data[0].Status) > 0 ) ) {
                            classArray["Employees"] = new classType2(data,"Employees",2);
                            windowLog.trace("Load all employees completed succesfully("+classArray["Employees"].arr.length+")");
                            classArray["Employees"].colors=[];
                            classArray["Employees"].arr.forEach( (key) => { 
                                classArray["Employees"].pNames[key.fullname.toString()]=key.employee_id;    // initialize the employee/id array 
                                classArray["Employees"].colors[key.fullname.toString()]=key.profile_color;  // initialize the employee/colors array 
                            });
                    }
                    else {
                        windowLog.warn("error loading employees, exit");
                        logout();
                    }
                },
                error     	: (function (jqxhr, textStatus, error ) {
                    windowLog.warn("Load employees failed:"+textStatus + ", " + error); 
                    logout();
                })
        });


        $.ajax({url         :   "../main/read_hourlyrate.php",
                method      :   "POST",
                dataType    :   "json",
                async       :   false,  
                data        :   {employeeID: "all"},
                success     :   function (data) { 
                    if ( ( data != '' ) && 
                         ( Number(data[0].Status) > 0 ) ) {
                        classArray["Hourly Rate"] = new classType2(data,"Hourly Rate",2);
                        windowLog.trace("Load all hourly rate completed succesfully("+classArray["Hourly Rate"].arr.length+")");
                    } else { 
                        windowLog.warn("Failed to log hourlyrate, exit"); 
                        logout();
                    }
                },
                error       :   function (jqXHR, textStatus, error) { 
                    windowLog.warn("Load employees failed:"+textStatus + ", " + error); 
                    logout();
                }
        });
        
        let data ="";

        $.ajax({url         :   "../main/read_projects.php",
                type        :   "GET",
                dataType    :   "json",
                async       :   false, // Make the request synchronous
                    success: function(data) {
                        Projects = new classProjects(data);
                        classArray["Projects"] = Projects;
                        if (Projects.length > 0) {
                            lastID["Projects"] = Number(Projects.arrProjects[Projects.arrProjects.length-1].project_id);
                            windowLog.trace("Project Data received");
                        } else {
                            windowLog.warn("No projects found");
                        }
                    },
                error     	: function (jqxhr, textStatus, error ) {
                    windowLog.warn("Load projects failed:"+textStatus + ", " + error); 
                    logout();
                }
        });

        $.ajax({url     : "../estimates/read_estimates.php",
            method		: "POST",
            data      	: JSON.stringify({'calltype':'all'}),
            dataType	: "json",
            async       : false,  
            success		: function(data) {
                if ( (data != '') &&
                        (Number(data[0].Status) > 0) )  {
                        classArray["Estimates"]  = new classType1(data,"Estimates",1);
                        windowLog.trace("Load all estimates completed succesfully("+classArray["Estimates"].arr.length+")");
                } else	{
                    windowLog.warn("error loading estimaates, exit");
                    logout();
                }
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load estimates failed:"+textStatus + ", " + error);
                logtout();
            })
        });

        data ="";
        $.ajax({url     : "../leads/read_leads.php",
            method		: "POST",
            data      	: JSON.stringify({'calltype':'all'}),
            dataType	: "json",
            async       : false,  
            success		: function(data) {
                if ((data != '') &&
                        (Number(data[0].Status) > 0) )  {
                        classArray["Leads"]  = new classType1(data,"Leads",1);
                        windowLog.trace("Load all Leads completed succesfully("+(classArray["Leads"].arr.length)+")");
                } else	{
                    windowLog.warn("error loading Leads, exit");
                    logout();
                }
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load Leads failed:"+textStatus + ", " + error);
                logtout();
            })
        });

        data ="";
        $.ajax({url     : "../customers/read_customers.php",
            method		: "POST",
            data      	: JSON.stringify({'calltype':'all'}),
            dataType	: "json",
            async       : false,  
            success		: function(data) {
                if (( data != '' ) &&
                    ( Number(data[0].Status) > 0 ))  {
                        classArray["Customers"] = new classType1(data,"Customers",1);
                        classArray["Customers"].cNames=[];
                        //classArray["Customers"].firstNames=[];
                        //classArray["Customers"].lastNames=[];
                        classArray["Customers"].telNumbers=[];
                        classArray["Customers"].zips=[];
                        classArray["Customers"].emails=[];
                        for (var i = 0; i < classArray["Customers"].arr.length; i++) { //loop throu the return msg 
                            const tempEntry=classArray["Customers"].arr[i];
                        
                            classArray["Customers"].cNames.push(buildCstmrSearchString(tempEntry));
                           // classArray["Customers"].firstNames.push(classArray["Customers"].arr[i].customer_first_name);
                           // classArray["Customers"].lastNames.push(classArray["Customers"].arr[i].customer_last_name);
                            classArray["Customers"].telNumbers.push(classArray["Customers"].arr[i].customer_tel_number);
                            classArray["Customers"].zips.push(classArray["Customers"].arr[i].zip);
                            classArray["Customers"].emails.push(classArray["Customers"].arr[i].customer_email);
                        }
                        windowLog.trace("Load all Customers completed succesfully("+classArray["Customers"].arr.length+")");
                } else	{
                    windowLog.warn("error loading Customers.. see admin");
                    logout();
                }
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load Customers failed:"+textStatus + ", " + error); 
                logout();
            })
        });

        $.ajax({url     : "../main/load_task.php",
            method		: "POST",
            data      	: JSON.stringify({'calltype':'scheduler'}),
            dataType	: "json",
            async       : false,  
            success		: function(tasks) {
                if ((tasks != '')) {
                    //windowLog.trace("Load all tasks completed succesfully");
                    Tasks = new classTasks(tasks); // create Tasks class
                    classArray["Scheduler"] = Tasks;
                   
                    //lastID["Scheduler"]=Tasks.nextTaskID;
                    windowLog.trace("Set the clock to pollingTasks:"+appConfig.tsPolling_Interval*1000*60);
                    Tasks.intervalEJID=window.setInterval(function() {
                        refreshReportCallBack();
                    }, appConfig.tsPolling_Interval*1000*60);
                    windowLog.trace("Load all Tasks succesfully("+classArray["Scheduler"].arr.length+")");
                    assignedTasksArr=Tasks.arrTasks.filter((x) => ( ( x.employee_id > 0) && ( Number(x.is_assigned) == 1 ) && ( classArray["Employees"].arr[classArray["Employees"].arr.findIndex(t => t.employee_id == x.employee_id)].is_active == "1" ) ));

                } else	{
                    windowLog.trace("error loading tasks, exit");
                    logout();
                }
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load schedule failed:"+textStatus + ", " + error); 
                logout();
            })
        });

        $.ajax({url         : "../main/read_employee_jobs.php",
                method		: "POST",
                data      	: JSON.stringify({'projectNumber':'all'}),
                dataType	: "json",
                async       : false,  
                success		: function(data) {
                    if (( data != '' ) &&
                        ( Number(data[0].Status) > 0 ))  {        
                        classArray["Employee Jobs"] = new classType1(data,"Employee Jobs",1);
                        classArray["Employee Jobs"].isTotalCost=false;
                        lastID["Employee Jobs"]=(Number(Math.max(lastID["Employee Jobs"],lastID["Scheduler"])))+1;
                        windowLog.trace("Load all employee jobs succesfully("+classArray["Employee Jobs"].arr.length+")");
                    } else {
                        windowLog.trace("error loading employee jobs, exit");
                        logout();
                    }},
                error     	: function (jqxhr, textStatus, error ) {
                    windowLog.warn("Load empoyee jobs failed:"+textStatus + ", " + error); 
                    logout();
                }
        });
        
        $("#innerPT_ID,#CloseBtnPsumry").on("click", innerPThandler);

        windowLog.trace("Window HxW:"+window.innerHeight+":"+window.innerWidth);
        if ( ( window.innerHeight < 480 ) || 
             ( window.innerWidth  < 480 ) ) {
            zoom(0.8); 
            $("#footer").css({'font-size' : '7px'});
            isZoom = true;
            windowLog.trace("Zoom out");
        }
        if ( pageAccessedByReload )
            displayMainMenue(window.location.hash.slice(1)); // home or config
    }
    else {
        $('img[id^=Pls]').remove();
        $("#userFileUpload").on("click",function(event) { return uploadFilesCheckBoxHandler(event); });
        screenNumber = "user";
        //displayMainMenue("engineer");    
        //$("#newCustomer,#newScheduler").remove();
    }

    $("#ul, #ur, #ll, #lr").addClass("homeScreen");
});

function checkRefresh() {
    switch ( event.currentTarget.performance.navigation.type ) {
        
        case 0 : msg = "the user just typed in an URL ";
            break;
        case 1 : msg = "the page reloaded ";
            break;
        case 2 : msg = "the back button is clicked ";
            break;
    }
}

document.addEventListener('visibilitychange', e=>{
    if (document.visibilityState === 'visible')
        windowLog.trace("Visible");
    else 
        windowLog.trace("NotVisible");
})

function displayMainMenue(screenName) {

    //var t_index=0;
    //today=date.getFullYear()+"-"+(("0" + (date.getMonth() + 1)).slice(-2))+"-"+(("0" + date.getDate()).slice(-2)); 
    //const date=new Date();
    hashPassword("hello");
    windowLog.trace("inside DisplayMainMenue:today-"+today);

    if (username === 'eddie') { //only Eddie could access
        if (screenName === "home") {
          
            $('#customers').html('<label tabindex="15" for="cstmrShortCut" class="css-3d-text label2" id="customersLbl">Customers</label><a><img tabindex="16" src="../misc/plus.png" id="newCustomer" width="10" height="10"></a>\n<input tabindex="17" type="text" class="prjShortCutInput" id="cstmrShortCut" name="customerNumber" size="20" maxlength="50">\n'); 
            $("#tHalf").html('<label tabindex="18" class="css-3d-text label2" id="schedulerLabelID">Scheduler</label><a><img tabindex="19" src="../misc/plus.png" width="10" id="mainNewTaskSchdlr" height="10"></a>');
            $('#bHalf').html('<label tabindex="20" for="newProject" class="css-3d-text label2" id="projectLbl">Projects</label><a><img tabindex="21" src="../misc/plus.png" id="newProject" width="10" height="10"></a>\n<input tabindex="22" type="text" class="prjShortCutInput" id="prjShortCut" name="projectNumber" size="20" maxlength="50">\n');
            $('#cText').invisible();
            $('#userFileUpload,#fileslabel').hide();
            //$('#tHalf').html(`<label class="css-3d-text label2" id="tHalf"></label><a><img src='../misc/plus.png' alt='plus' width='10' id="newScheduler" height='10'></a>`);        
            //$("#tHalf,#bHalf").visible();
            //$('#tHalf').css({'justify-content' : 'center',
            // 'align-item' : 'center'});
            //$('#bHalf').show();
        }
        else { 
            $('#tHalf').html('');
          
            // screenName == config or engineer
            //$("#tHalf").html("");
            //$('#tHalf').addClass("css-3d-text");
            //$('#tHalf').css({'font-size'		:	'22px',
            //                 'cursor'			: 	'pointer'});
            //$('#tHalf').show();
            //$('#tHalf').visible();
            //$("#tHalf,#newScheduler,#buttomHalf").invisible();
        }
        for (var i = 0; i < 4; i++)  // loop over the captions	
            document.getElementById(captions["genesis"][i]).innerHTML=captions[screenName][i];
    }
    else {	// Prepare the User's main menue
        //t_index = 3;
        $('#upperRightQuadrant').hide();
        MainMenue.hide();
        setNewTaskInterval();	// how often new task are monitored for the employee
        $('#userFileUpload').prop('checked', false); 
        const lowerLeftIndex = captions["genesis"].indexOf("lowerLeft");
        const lowerRightIndex = captions["genesis"].indexOf("lowerRight");
        document.getElementById(captions["user"][lowerLeftIndex]).innerHTML=captions["user"][lowerLeftIndex];
        document.getElementById(captions["user"][lowerRightIndex]).innerHTML=captions["user"][lowerRightIndex];

        //document.getElementById("userFileUpload").checked=0;
        /*if ( ( typeof classArray["Persmissions"][9] != "undefined") &&
            ( classArray["Persmissions"][9] == true) ) */
        /* $('#upperRight,#mainDiv,#userFileUpload,#fileslabel').show(); // from now on, upperRightQuadrant contorl the hide show of the upperright
        if ( ( typeof classArray["Persmissions"][11] != "undefined") &&
        ( classArray["Persmissions"][11] == true) ) */
        //document.getElementById(captions[0][0]).innerHTML=captions[t_index][0];
        /*if ( ( typeof classArray["Persmissions"][2] != "undefined") &&
            ( classArray["Persmissions"][2] == true) ) */
        //document.getElementById(captions[0][1]).innerHTML=captions[t_index][1];
        /*if ( ( typeof classArray["Persmissions"][8] != "undefined") &&
            ( classArray["Persmissions"][8] == true) ) */
    }  
}

// Retrieve the contractors per  project
function pEmployeeJobs() {

    displayEmployeeJobResults($('#jName').text(),"#result-table3"); // call wth the project number

    return false;
}

function pPayments() {

    displayPaymentResults($('#jName').text(),"#result-table3"); 
            
    return false;
}

function pTotalCosts() {

    return false;
}

function pPurchases() {

    displayPurchaseResults($('#jName').text(),"#result-table3");

    return false;									
}

// Retrieve the contractors per  project
function pContractorJobs() {

    displayContractorJobsResults($('#jName').text(),"#result-table3");

    return false;
}

// Called to show the projectSummary
function showProjectSummary(rowNumber,prjIndex) {
    
    windowLog.trace("Inside showProjectSummary");

    Projects.setprojectNumber(prjIndex); // Set the project id in the class
    //$(".grid-gallery").invisible();
    $(".grid-gallery").hide();
    $(".main_menue").hide();
    $("#scrollDivID").css({'display' : "none"});
    $("#psDivID").css({'width' : "100%"});
    $("#psDivID").addClass("scrollit");
    $("#psDivID").show();
    $("#editLabelID").hide();
  
    // window.open("../main/project-summary.html","Ratting","width=550,height=170,left=150,top=200,toolbar=1,status=0,");
    $("#rootID,#configID,#libraryID,#systemID").hide();
    $("#pSummaryID").show();
    $("#jPnumber").html(Projects.projectNumber);   // show the project number
    $("#jEmployees").html("$ "+(Projects.getEmployeeCost(prjIndex)));
    $("#jContractos").html("$ "+(Projects.getContractorCost(prjIndex)));
    $("#jPurchases").html("$ "+(Projects.getTotalPurchases(prjIndex)));
    $("#jpTotalCosts").html("$ "+(Projects.getPrjTotalCosts()));
    Projects.setTotalPayments(prjIndex); // update the project class with the total project payments
    //$("#jTotal").html("$ "+(p.getTotal(index)));
    $("#jName").html(Projects.getPrjName(prjIndex));
    $("#jDetails").html(Projects.getDetails(prjIndex));
    $("#jAddress").html(Projects.getAddress(prjIndex));
    $("#jPayments").html("$ "+Projects.setTotalPayments(prjIndex));
    //pPayments(index);	// show the payments de©1827tails on the left pane of the projectSumamry window
    pEmployeeJobs(prjIndex); 	// show the employees jobs details on the right pane of the projectSumamry window
    $("#pBalance").html("<br>Total Balance<br>"+("$"+Projects.getTotalBalance(prjIndex))); 
    
    //e.stopPropagation();

    return false;
}

// called upon close the projectSummary window
function closeProjectSummary() {
    
    windowLog.trace("Inside closeProjectSummary");
    $("#pSummaryID").hide();
    $("#result-table3").html("");
    $("#rootID,#configID,#libraryID,#systemID").show();
    $("#psDivID").removeClass("scrollit");
    if ( screen_name.text == "Home" ) { // in case closed from the home screen project field
        home();
        $('.outer-table').visible();
        $("#result-table1").show();
        $(".main_menue").show();
        $("#navID,#main-menue,#customers,#tHalf").removeClass("greyed-out");
        $('img[id^="Pls"]').removeClass("greyed-out");
    }
    else {
        $("#scrollDivID").css({'display' : "block"});
        lastScreen="Projects";
    }
}

// handling lunch in and out
function employeeLunchClock(callType) {

    // type: lunchIn/lunchOut
    let formData = new FormData();
    formData.append('calltype',callType);
    formData.append('employee_id', eID);
    formData.append('task_id',currentWorkingTask.task_id);
    
    // Call PHP module to log the signin
    fetch("../main/insert_job2.php", {method    : "POST", 
                                      body      : formData})
        .then(response 	=> response.json())
        .then((data) 	=> {
                        const tToday=new Date();
                        if ( callType == "lunchIn") {
                            $('#upperLeft').html("Lunch Out");
                            currentWorkingTask.taskLunchSignInTime=tToday.getHours()+":"+String(tToday.getMinutes()).padStart(2,'0')+":"+String(tToday.getSeconds()).padStart(2,'0');//("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2);
                            currentWorkingTask.jobProgress == "lunchout" 
                        }
                        else
                            currentWorkingTask.taskLunchSignOutTime=tToday.getHours()+":"+String(tToday.getMinutes()).padStart(2,'0')+":"+String(tToday.getSeconds()).padStart(2,'0');
                        })
        .catch(error => {alert(error);
                         console.error('Error:', error);
                        return false;});
    return false;
}
/*const fileExists = file =>
                    fetch(file, {method: 'HEAD', cache: 'no-store'})
                    .then(response => ({200: true, 404: false})[response.status])
                    .catch(exception => undefined);*/

function upperLeft() {

    windowLog.trace("Inside Upper Left");
    if (username == 'eddie') {
        if ( screenNumber === "home" ) {
            $("#screen_name").html("Employee Jobs");
             displayEmployeeJobResults(0,"#result-table1") ;// 0 indicate all records to show
        }
        else
           manageEmployees("#result-table1") ;
    } else {
        if (currentWorkingTask.jobProgress != "") {
            $('#bHalf').removeClass("nextTask");
            $('#bHalf').addClass("taskResult"); 
        }
        windowLog.trace("Upper Left,JobP:"+currentWorkingTask.jobProgress);
        switch ( currentWorkingTask.jobProgress ) {
            case "open"             :
                currentWorkingTask.open();
            break
                
            case "signin"           :
                currentWorkingTask.signin();    
            break;
            
            case "lunchin"          :
                currentWorkingTask.lunchin();
                $('#upperRightQuadrant').hide();
            break;

            case "lunchout"         :
                currentWorkingTask.lunchout();
                $('#upperRightQuadrant').show();
            break;
        }
        function Yes() {
            switch ( currentWorkingTask.jobProgress )   {
                case "open"         :
                    employeeSignIn();
                break
                    
                case "signin"       :
                    currentWorkingTask.lunchin();
                    currentWorkingTask.jobProgress="lunchin";
                    $('#upperRightQuadrant').hide();
                    employeeLunchClock("lunchIn");
                break;
                
                case "lunchin"      :
                    currentWorkingTask.lunchout();
                    $('#upperLeft').html("");
                    currentWorkingTask.jobProgress="lunchout";
                    employeeLunchClock("lunchOut");
                    $('#upperRightQuadrant').show();
                break;
            }
            $('#tHalf').html(currentWorkingTask.description);   // restore the description

            return false;
        }   
        function No() {
            
            switch  (currentWorkingTask.jobProgress) {
                case "open":
                break;

                case "signin":
                case "lunchin":
            }

            $('#tHalf').html(currentWorkingTask.description);

            return false;
        }    
        $('#btnYes').click(Yes);
        $('#btnNo').click(No);
    }
    return false;	
}
                    
function upperRight() {

    windowLog.trace("Upper Right");
    if (username == 'eddie') {
        if ( screenNumber === "home" )
             displayPurchaseResults(0,"#result-table1");
        else
            displayVendors("#result-table1");
    } else {
        document.getElementById("userFileUpload").hidden=false;
        if (currentWorkingTask.jobProgress != "") {
            $('#tHalf').removeClass("nextTask");
            $('#tHalf').addClass("taskResult"); 
        }
        switch ( currentWorkingTask.jobProgress )   {
            
            case "signin"       :
            case "lunchout"     :   // allowed to signout only when sign in or if lucnh started, when lunch is closed  
                //$("#tHalf").unbind("click");  
                $("#tHalf").html("Are you sure you want to Sign Out<br><br><input type='button' class='button' value='Yes' id='btnYes'/>&nbsp<input type='button' class='button' value='No' id='btnNo' />");
            break;

            case "lunchin"       :
                $("#tHalf").html("Please Clock Lunch out");
                $('#tHalf').show();
                setTimeout(() => $('#tHalf').html(currentWorkingTask.description), 2000);    // clear the message after 2 seconds
        }
    }
    function Yes() {
        employeeSignOut();
        $('#tHalf').html("");

        return false;
    }   
    function No() {
        //if (currentWorkingTask.taskStatus == 0)
        //    nextTask(event);
        //else 
        $('#tHalf').html(currentWorkingTask.description);
        
        return false;
    }    
    $('#btnYes').click(Yes);
    $('#btnNo').click(No);

    return false;	
}

function lowerRight() {

    if (username == 'eddie') {
        
        if ( screenNumber === "home" ) 
            displayContractorJobsResults(0,"#result-table1") ;
        else 
            displayCompaniesResults("#result-table1"); 
    } else  // Upload files
        showFileUpload("","userUpload","fileUploadControl","");
    return false;	
}

function lowerLeft() {
    
    if (username == 'eddie') { 
            if (screenNumber === "home")
           displayPaymentResults(0,"#result-table1");
        else 
            displayContractors("#result-table1");
    } else  // Upload Gas purchases
        showFileUpload("","gasUpload","fileUploadControl","");
    
    return false;	
}

function employeeSignIn() {

    windowLog.trace("Inside employeeSignIn:employeeID="+eID);

    const arrObj={'calltype':'employee','employee_id':eID};	// set the parqmteres to sent to the server
    $.ajax({url			: "../main/load_task.php",
            method		: "POST",
            data        : JSON.stringify(arrObj),	// it has to be non scheduler
            dataType	: "json",
            success		: function(tasks) {
                if ( tasks[0].Status == "success" ) { 
                    //document.getElementById("screen_name").hidden=false;
                    let formData = new FormData();
                    formData.append('calltype',"signin");
                    formData.append('employee_id',tasks[1].employee_id);
                    formData.append('project_number',tasks[1].project_name);
                    formData.append('task_id',tasks[1].task_id);
                    
                    // Call PHP module to log the signin
                    fetch("../main/insert_job2.php", {method 	: "POST", 
                                                      body      : formData})
                        .then(response 	=> response.json())
                        .then((data) 	=> CheckSignInStatus(data,tasks[1].project_number,tasks[1].task_id) )
                        .catch(error => {
                            alert(error);
                            console.error('Error:', error);
                            return false;});
                } 
                else {
                    CheckSignInStatus(tasks);
                    windowLog.trace("Signin-ret_error:"+tasks[0].Status+" Notes:"+tasks[0].Notes);
                }
            }
        });
    return false;
}

function CheckSignInStatus(result,pNumber,tID) {
    
    //document.getElementById("screen_name").hidden=true;
    var msg=currentWorkingTask.description;
    //var font_color='black';
    if ( Number(result[0].Status) <= 0 ) 
        msg = result[0].Notes; // in case of error, the err msg in the Notes
    else {
        IsTaskInProgress=true;
        isShowed = true;
        $('#upperLeft').html("Lunch In");
        $('#upperRight').html("Sign Out");
        $('#upperRightQuadrant').show();	// show the Signout plus upload files
        currentWorkingTask.taskStatus=2;	// task is in signin status
        currentWorkingTask.task_id=tID;
        currentWorkingTask.prjNumber=pNumber;
        currentWorkingTask.taskSignInTime=("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2);
        currentWorkingTask.jobProgress="signin";
    }
    $('#tHalf').removeClass("nextTask");
    $('#tHalf').addClass("taskResult"); 
    $('#tHalf').html(msg);	// display the description

}

function employeeSignOut() {

    windowLog.trace("employeeSignOut")
    let formData = new FormData();

    formData.append('calltype', "signout");
    formData.append('employee_id', eID);
    formData.append('task_id', currentWorkingTask.task_id);
    formData.append('project_number',currentWorkingTask.prjNumber);

    fetch("../main/insert_job2.php", {method    : "POST", 
                                      body      : formData })
        .then(response	=> response.json())
        .then((data)	=> checkSignOutStatus(data) ) // Print return message (success or failure)
        .catch(error	=> console.error('Error:', error));
        return false;
    }

function checkSignOutStatus(result) {

    //document.getElementById("screen_name").hidden=false;
    var msg;

    if ( Number(result[0].Status) <= 0 ) {
        msg="SignOut failed: "+result[0].Notes;
    }
    else {
        IsTaskInProgress=false;
        currentWorkingTask.reset();
        $('#upperLeft').html("");
        $('#upperRightQuadrant').hide();	// Hide the quadrent
        $('#tHalf').removeClass("nextTask");
        $('#tHalf').addClass("taskResult"); 
        $('#tHalf').html("Sign Out succesfully from project "+result[0].Status);
        setTimeout(() => $('#tHalf').html(""), 2000);  // clear the message after 2 seconds
        loadNextTask();
    }
}

// hide the main circle, show the table title and new button
function prepareDisplay(display) {

    windowLog.trace("Inside prepareDisplay:"+display);

    var editHtml=`<div id="editDiv" style="display:flex;align-items:flex-end"><a tabindex="0" class="label1">Edit </a><label class="switch"><input type="checkbox" id="editCBID" name="editMode" value="no"><span id="editSliderID" class="slider round"></span></label></div>`;

    $("#editLabel").html(editHtml);
    $(".grid-gallery").hide();
    //$("#editLabel").css({'text-align'   : 'right'});
    $(".main_menue").hide();
    $(".scrollit").css({'display' : "block"});
    $("#caption,#mainDiv,#result-table1").show();
    $("#savingTD").html("<a style=\"font-size : 12px;\" id=\"saveTableLabel\"></a>");
    $("#centercellID,#newTaskShortCutID").invisible();
    $("#screen_name").unbind('mouseenter mouseleave');
    //$('#screen_name').css({'cursor' : 'auto'});
    $("#leadsTab_name").html("");

    if ( display == "#result-table1") {
        document.getElementById("result-table1").hidden=false;
        $("#screen_name").show();
        $("#result-table1").unbind('mouseover');
        $("#result-table1").unbind('mouseleave');
        $("#result-table1").unbind('mouseenter');
        //$("#result-table1").bind('mouseover',mouseOverHandler);
        //$("#result-table1").bind('mouseleave',mouseLeaveHandler);
        
    }
    $('#addSingleRec').html("");
    if ( $('#overLay ul li').length )  // just in case reset the list
        $("#overLay ul").empty(); // $('#overLay ul li').html("");
}


function prepareProjectRecords2Display(inputArr) {

    let outArr="";
    var tabI=1;

    for (var i = 0; i < inputArr.length; i++) { //loop throu the return msg 
        //if ( (passedArray[i].project_m_contractor == projectManager ) || for future
        // ( username == "eddie") ) {    // only show projects for the associated with the PM or Eddie
        outArr += `<tr>`;
        outArr += `<td></td>`; // pleace holder for delete image
        outArr += `<td><input tabindex="0" type="text" name="projectNumber" id="prjctNumberID" class="projectNameClass" value="${inputArr[i].project_number}" size="44" maxlength="50">`;
        outArr += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="projectID" value=${inputArr[i].project_id}></td>`;
        outArr += `<td><input tabindex="0" type="text" name="companyName" id="cnID" class="projectNameClass" value="${inputArr[i].company_name}"></td>`;
        outArr += `<td><input tabindex="0" type="text" name="customerLastName" id="clnID" class="projectNameClass" value="${inputArr[i].project_cstmr_lastname}"></td>`;
        outArr += `<td><input tabindex="0" type="text" name="projectType" id="ptID" class="projectNameClass" value="${inputArr[i].project_type}"></td>`;
        outArr += `<td><input tabindex="0" type="text" name="projectSalesRep" id="psrID" class="projectNameClass" value="${inputArr[i].project_m_contractor}"></td>`;
        outArr += `<td><input tabindex="0" type="text" name="projectAddress" id="paddrID" class="projectNameClass" value='${inputArr[i].project_address}'"></td>`;
        fileupload=uploadFilesMngr(Number(inputArr[i].file_uploaded,(inputArr[i].project_number != "")));
        outArr += `<td>${fileupload}</td>`;
        outArr += `</tr>`;
        //sumOfProjects += Number(passedArray[i].project_total_payments);
        // var url=passedArray[i].project_address;
        //}
    } 

    return outArr;
}

function displayProjects(projectManager) {

    const screen_name="Projects";
    windowLog.trace("Inside "+screen_name);
    let out = "";
    //var slidingWindow;
    var sumOfProjects=0;

    passedArray=Projects.arrProjects;
    lastScreen=screen_name;

    $("#screen_name").html(lastScreen);

    prepareDisplay("#result-table1");
   
    $('.outer-table').invisible();
    //out +=`<thead id="mainHeader"><tr><th></th>`; 
    
    
   
    lastID["Projects"]=Number(Projects.arrProjects[Projects.arrProjects.length-1].project_id);

    /*minRec=Math.max(Projects.arrProjects.length-200,0);
    maxRec=Math.min(Projects.arrProjects.length+200,Projects.arrProjects.length);
    slidingWindow=refreshProjects(minRec,maxRec);*/
    windowLog.trace("Start processing projects");
    out =  headers[screen_name]['columns'];
    out += `<tbody class="thover">`;
    out += prepareProjectRecords2Display(Projects.arrProjects);
    /*
    for (var i = 0; i < Projects.arrProjects.length; i++) { //loop throu the return msg 
            //if ( (passedArray[i].project_m_contractor == projectManager ) || for future
            // ( username == "eddie") ) {    // only show projects for the associated with the PM or Eddie
            out += `<tr>`;                
            out += `<td></td>`; // pleace holder for delete image
            out += `<td tabindex="0"><input type="text" name="projectNumber" id="prjctNumberID" class="projectNameClass"value="${passedArray[i].project_number}" size="44" maxlength="50">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="projectID" value=${passedArray[i].project_id}></td>`;
            out += `<td tabindex="0"><input type="text" name="companyName" id="cnID" class="projectNameClass" value="${Projects.arrProjects[i].company_name}"></td>`;
            out += `<td tabindex="0"><input type="text" name="customerLastName" id="clnID" class="projectNameClass" value="${passedArray[i].project_cstmr_lastname}"></td>`;
            out += `<td tabindex="0"><input type="text" name="projectType" id="ptID" class="projectNameClass" value="${passedArray[i].project_type}"></td>`;
            out += `<td tabindex="0"><input type="text" name="projectSalesRep" id="psrID" class="projectNameClass" value="${passedArray[i].project_m_contractor}"></td>`;
            out += `<td tabindex="0"><input type="text" name="projectAddress" id="paddrID" class="projectNameClass" value='${passedArray[i].project_address}'"></td>`;
            fileupload=uploadFilesMngr(Number(pArray[i].file_uploaded));
            out += `<td style="width:2%">${fileupload}</td>`;
            out += `</tr>`;
            sumOfProjects += Number(passedArray[i].project_total_payments);
            // var url=passedArray[i].project_address;
        //}
    } */
    
    out += `</tbody></table>`;//</div>`;
    windowLog.trace("Finish processing projects");
    document.querySelector("#result-table1").innerHTML=out+`</tbody>`;  // prepare the table
    //tableSummary(Projects.arrProjects.length,sumOfProjects);

    $('.outer-table').visible();    // show the table

    currCell = $('#result-table1 tbody tr:last td:eq(2)').first(); // currCell points to 2nd TD in the last TR (skip the del image placeholder)
    currCell.children().first().focus();// focus on the first input!!
    $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"));

    /* setCellFocusVal();
        
    document.getElementById("projectDateID").addEventListener("focusin",projectDateFunction);
    AddingSort(); // adding sorting option to the table
    $("#result-table").tablesorter({sortList: [[0,0]]});
   
    const numberofRec=Projects.arrProjects.length;

    var isScroll=null;
    var minRec,maxRec,recRatio=0;*/

    return false;
}

// currently not implemented
function refreshProjects(start,end) {
    
    var out="";
    var tabI=0;

    windowLog.trace("Inside refresh");
    tabI=start+1;
    for (var i = start; i < end; i++) { //loop throu the return msg 
        out += `<tr>`;
        
        //jTime=passedArray[i].project_date_created.slice(-5); // retreive the hh:mm
        //out += `<td><a href=""><img src='../misc/minus-2.jpg' value="DeleteImage" alt='plus' width='10' height='10' onclick='return deleteRow(event)'></a></td>`;
        out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
        out += `<td><input tabindex="0" type="text" name="projectNumber" class="projectNameClass" value="${Projects.arrProjects[i].project_number}">`;
        out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="projectID" value=${Projects.arrProjects[i].project_id}></td>`;
        out += `<td><input tabindex="0" type="text" name="companyName" class="projectNameClass" value='${Projects.arrProjects[i].company_name}'></td>`;
        out += `<td><input tabindex="0" type="text" name="customerLastName" class="projectNameClass" value='${Projects.arrProjects[i].project_cstmr_lastname}'></td>`;
        out += `<td><input tabindex="0" type="text" name="projectType" class="projectNameClass" value='${Projects.arrProjects[i].project_type}'></td>`;
        out += `<td><input tabindex="0" type="text" name="projectSalesRep" class="projectNameClass" value='${Projects.arrProjects[i].project_m_contractor}'></td>`;
        out += `<td><input tabindex="0" type="text" name="projectAddress" class="projectNameClass" value='${Projects.arrProjects[i].project_address}'></td>`;
        //out += `<td tabindex="0"><a target="_blank" rel="noopener noreferrer" style="font-size:13px; text-decoration:none;" href="http://maps.google.com/?q=${passedArray[i].project_address}">${passedArray[i].project_address}</a></td>`;
        var url=Projects.arrProjects[i].project_address;
        out += `</tr>`;
    }
    return out;
}

/*function projectDateFunction(e) {
    event.target.style.background = "pink";
        windowLog.trace("hi there");
}*/

function projects(e) {

    displayProjects(username);
        
    return false; 
}

function buttomHalf(e) {

    
}

function displayPaymentResults(projectNumber,targetDisplay) {
   
    const screen_name="Payments";
    windowLog.trace("Inside "+screen_name);
    let eArray=[];
    let out = "";
    var tabI=1;
    var sumOfPayments=0;    // sum of all payments


    if ( projectNumber == 0 ) 
        eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
    else 
        // filter only the records of the project number
        eArray=classArray[screen_name].arr.filter(((element) => element.project_number == projectNumber)); //EmployeeJobs.arrEmployeeJobs.filter(((element) => element.project_number == projectsList)); 			
    length=eArray.length;

    if (targetDisplay == "#result-table1") { // Only  update the screen name if employee-jobs is displayed in the top screen
        $("#screen_name").html(screen_name);
        lastScreen=screen_name;
    }

    prepareDisplay(targetDisplay); 
      
    if (targetDisplay == "#result-table1") // if the targetDisplay is not the main then do not show the project number
        out +=`<thead id="mainHeader"><tr><th></th><th class="pmClass">Project Number</th>`; 
    else
        out += `<table class="res_table2" id="result-table"><thead><tr>`;
    out += headers[screen_name]['columns']+`</tr></thead>`;
    out += `<tbody id="tBodyID" class="thover">`; 
    for (var i = 0; i < length; i++) { //loop throu the return msg 
        fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded,(eArray[i].project_number != "")));
        outFiles = `<td>${fileupload}</td>`;
        if ( targetDisplay == "#result-table1" ) {
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" type="text" name="projectNumber" class="projectNameClass" value="${eArray[i].project_number}" size="44" maxlength="50">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="payment" value=${eArray[i].payment_id}></td>`;
            out += `<td><input type="text" id="pymntAmntID" name="paymentAmount" class="projectNameClass" value=${eArray[i].payment_amount}></td>`;
            out += `<td><input type="date" id="pymntDateID" name="paymentDate" class="inputDate" value=${eArray[i].payment_date}></td>`;
            out += `<td><input type="text" id="pymntMthdID" name="paymentMethod" class="projectNameClass" value="${eArray[i].payment_method}"></td>`;
            out += `<td><input type="text" id="pymntNumberID" name="checkNumberCNF" maxlength="20" class="projectNameClass" value='${eArray[i].checknumber_cnf}'></td>`;
            out += `<td><input type="text" id="paymntDrscnID" name="Description" class="projectNameClass" value="${eArray[i].description}"></td>`;
            out += outFiles;
            out += `</tr>`;
            if ( eArray[i].payment_amount != "")
                sumOfPayments += Number(eArray[i].payment_amount);
        }
        else {
            out += `<tr>`;
            out += `<td>${eArray[i].payment_amount}</td>`;
            out += `<td>${eArray[i].checknumber_cnf}</td>`;
            var jsDate=sql2JSDate(eArray[i].payment_date,0);
            out += `<td>${jsDate}</td>`;
            out += `<td>${eArray[i].payment_method}</td>`;
            
            out += `<td>${eArray[i].description}</td>`;
            out += outFiles;
            out += `</tr>`;
        }
    }
    out += `</tbody></table>`;
    
    document.querySelector(targetDisplay).innerHTML = out+`</tbody>`; // print to screen the return messages
    if (targetDisplay == "#result-table1") {
        currCell = $('#result-table1 tbody tr:last td:eq(1)').first(); // currCell points to 2nd TD in the last TR
        setCellFocus();
        tableSummary(length,sumOfPayments);
         //AddingSort(); // adding sorting option to the table
    }
    $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"))
    
    return false;
} 

function displayEmployeeJobResults(pojectNumber,targetDisplay) {

    const screen_name="Employee Jobs";
    windowLog.trace("Inside "+screen_name);
    lastScreen="Employee Jobs";

    let out = "";
    var tabI=1;
    let eArray=[];
    var sumofJobs=0;
   
    $.ajax({
        url         : "../main/read_employee_jobs.php",
        method      : "POST",
        data        : JSON.stringify({'projectNumber':'all'}),
        dataType    : "json",
        async       : false,
        success     : (function(data) {  
            classArray["Employee Jobs"] = new classType1(data,"Employee Jobs",1);
            lastID["Employee Jobs"]=(Number(Math.max(lastID["Employee Jobs"],lastID["Scheduler"])))+1;
        }),
        error       : (function (xhr) { 
              windowLog.trace("Save schedule failed"); })
        });

    if ( pojectNumber == 0 ) 
        eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
    else {
        eArray = classArray[screen_name].arr.filter(((element) => element.project_number == pojectNumber));
        classArray[screen_name].fArray =eArray.filter(((element) => Number(element.file_uploaded) >= 1));
    }

    const length=eArray.length;
    const localCurrentTime=("0" + (date.getHours())).slice(-2)+":"+("0" + (date.getMinutes())).slice(-2);
    
    prepareDisplay(targetDisplay); // hide the top menue
   
    if (length == 0) {
        $(targetDisplay).html("<br><br>No records to show");
        $(targetDisplay).css({'font-size' 	: '13px',
                              'color' 		: 'red'});
    }
    else { 
        if (targetDisplay == "#result-table1") {
            
            var tempOut = '<a class="hyperlinkLabel" id="exportDialogueID" onclick="return exportDlgReport(event)">&nbsp Export Report</a><dialog id="exportDateRangeDialog"></dialog>';
            tempOut += '<a class="hyperlinkLabel" id="ejTotalCostID"><label for="isTC" class="label1">&nbsp Show Total Cost<input type="checkbox" id="isTC" name="checked" value="no" class="checkboxes"/></label></a>';
            $("#exportID").html(tempOut);
            $("#exportID").show();
            out += `<thead id="mainHeader"><tr><th></th><th class="pmClass">Project Number</th>`; 
        }
        else
            out += `<table class="res_table2" id="result-table"><thead><tr>`;
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        let  fileupload="0";
        for (var i = 0; i < length; i++) { 
            if (eArray[i].job_signin != null) 
                dateSignIn = eArray[i].job_signin.split("-");
            var jsDate=sql2JSDate(eArray[i].job_date,1);
            
                out += `<tr style="background-color: `+classArray["Employees"].colors[eArray[i].employee_fname]+`">`;;//bgColor[eArray[i].employee_fname]+`">`;
            
            if (targetDisplay == "#result-table1") {    // in main display the user allowed to edit, in psummary , only view
                //var signoutTime="&nbsp:&nbsp";
                var jobSignIn="";
                if ( (eArray[i].job_signin != "00:00:00") && // not allowed to delted if already signedin
                     (eArray[i].job_signin != null) ) {
                    out += `<td style="width:1%"></td>`;
                    jobSignIn=eArray[i].job_signin.slice(-8,-3);
                }
                else
                    out += `<td style="width:1%"><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;

                out += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectName" class="projectNameClass" size="44" maxlength="50" value="${eArray[i].project_number}">`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="taskID" value=${eArray[i].task_id}></td>`;
                out += `<td><input tabindex="0" type="text" id="fullnameID" name="fullName" class="projectNameClass" maxlength="30" value="${eArray[i].employee_fname}"></td>`;
                out += `<td><input tabindex="0" type="date" id="jobDateID" name="jobDate" class="inputDate" value=${jsDate}></td>`;
                out += `<td><input tabindex="0" type="time" id="jobSignInTimeID" name="jobSigninTime" class="inputTime" value=${jobSignIn}></td>`; 
                lunchSigninTime =  "&nbsp";
                if  ( ( eArray[i].lunch_signin != "00:00:00" ) &&
                      ( eArray[i].lunch_signin != null ) )
                    lunchSigninTime = eArray[i].lunch_signin.slice(-8,-3);
                out += `<td><input tabindex="0" type="time" id="lunchSignInTimeID" name="lunchSignin" class="inputTime" value=${lunchSigninTime}></td>`; 
                lunchSignoutTime =  "&nbsp";
                if  ( ( eArray[i].lunch_signout != "00:00:00" ) && 
                        ( eArray[i].lunch_signout != null ) )
                    lunchSignoutTime = eArray[i].lunch_signout.slice(-8,-3); 
                out += `<td><input tabindex="0" type="time" id="lunchSignOutTimeID" name="lunchSignOut" class="inputTime" value=${lunchSignoutTime}></td>`;
                jobSignoutTime = "&nbsp";
                if  ( ( eArray[i].job_signout != "00:00:00" ) &&
                        ( eArray[i].job_signout != null ))
                    jobSignoutTime = eArray[i].job_signout.slice(-8,-3);
                out += `<td><input tabindex="0" type="time" id="jobSignOutTimeID" name="jobSignOut" class="inputTime" value=${jobSignoutTime}></td>`;
                out += `<td><input tabindex="0" type="text" id="totalHoursID" name="totalHours" readonly class="projectNameClass" maxlength="5" value="${eArray[i].total_hours}"></td>`; // Show hours
                
                const tID = eArray[i].task_id;

                const entryNumber = Tasks.arrTasks.findIndex(t => t.task_id == tID);
                if ( entryNumber != -1 ) 
                    description = Tasks.arrTasks[entryNumber].task_description;
                else
                    description = eArray[i].description;

                out += `<td><textarea tabindex="0" id="ejDrscnIID" name="description" class="projectNameClass notesClass" rows="1" cols="33">${description}</textarea></td>`;
                out += `<td><input tabindex="0" type="text" id="lbrCostID" hidden name="labor_cost" class="projectNameClass" readonly value="${eArray[i].labor_cost}"></td>`;
                if ( eArray[i].labor_cost !=  "" )
                    sumofJobs += Number(eArray[i].labor_cost);

                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));
                out += `<td>${fileupload}</td>`;
            }
            else {	
                out += `<td>${eArray[i].employee_fname}</td>`;
                jsDate=sql2JSDate(eArray[i].job_date,0);
                out += `<td>${jsDate}</td>`;
                if  ( ( eArray[i].job_signin != "00:00:00" ) &&
                        ( eArray[i].job_signin != null ) )
                    out += `<td>${eArray[i].job_signin.slice(-8,-3)}</td>`;
                else
                    out += `<td></td>`;    
                if  ( ( eArray[i].lunch_signin != "00:00:00" ) &&
                        ( eArray[i].lunch_signin != null ) )
                    out += `<td>${eArray[i].lunch_signin.slice(-8,-3)}</td>`;
                else 
                    out += `<td></td>`;
                if  ( ( eArray[i].lunch_signout != "00:00:00" ) &&
                        ( eArray[i].lunch_signout != null ) )
                    out += `<td>${eArray[i].lunch_signout.slice(-8,-3)}</td>`;
                else
                    out += `<td></td>`;
                if  ( ( eArray[i].job_signout != "00:00:00" ) &&
                        ( eArray[i].job_signout != null ) )
                    out += `<td>${eArray[i].job_signout.slice(-8,-3)}</td>`;
                else
                    out += `<td></td>`;
                out += `<td>${eArray[i].total_hours}</td>`;
                //out += `<td>${eArray[i].gas}</td>`; // not shopw gas Eyal 04-11
                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));
                outFiles = `<td>${fileupload}</td>`;

                out += `<td>${eArray[i].description}</td>`;
                out += `<td>${eArray[i].labor_cost}</td>`;
                out += `<td>${fileupload}</td>`; 
            }
            out += `</tr>`;
        }
        DelCounter=true;
        
        out += `</tbody></table>`;
        
        document.querySelector(targetDisplay).innerHTML = out+`</tbody>`; // print to screen the return messages
        
        if (targetDisplay == "#result-table1") {
            currCell = $('#result-table1 tbody tr:last td:eq(1)').first(); // currCell points to 2nd TD in the last TR
            setCellFocus();
            tableSummary(length,sumofJobs);
            //AddingSort();
        }
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"));

        $("#isTC").change(function() {
            
            var arrChkBox = document.getElementsByName("labor_cost");
            $(arrChkBox).toggle();

            return false;
        });
        
        $('[id^="jobSign"]').unbind("change");      // just in case unbind the old to avoid doubkle handlers
        $('[id^="jobSign"]').change(function(event) {
            onChangeSignTime(event)
            return false;
        });

        $('[id^="lunchSign"]').unbind("change");    // just in case unbind the old to avoid doubkle handlers
        $('[id^="lunchSign"]').change(function(event) { 
            onChangeLunchTime(event);
            return false;
        });
    }

    //maxScroll=$('.scrollit').scrollTop();

    return false;
} 

function finalUpload(gas) {


}

function submitUploadFiles(type) {

    windowLog.trace("submitUploadFiles");

}
function onCloseUpload() {

    windowLog.trace("onCloseUpload");
    //$("#uploadFilesID").hide();
    //document.getElementById("userFileUpload").checked=0;	// Reset the upload file check box
    $('#userFileUpload').prop('checked', false); 
    $("#innerCellID").show();
}

function No() {
        
    windowLog.trace("No");
    $('#tHalf').html(currentWorkingTask.description);
    // $('#tHalf').hide();
    onCloseUpload();
    
    return false;
}    

function checkUploadStatus(result) {

    var resultMSG="";
    windowLog.trace("inside CheckUploadStatus:"+result.Status);
    if ( Number(result[0].Status) > 0 ) { // Check the return code from upload operation
        msgColor ='green';
        resultMSG = "File(s) uploaded succesfully";
        

        /*if ( gas == 2 )	{ 
            onCloseUpload();
            $('#upperRightQuadrant').hide(); // only if Gas = 2 then hide the signout
            IsTaskInProgress=false;
            $('#upperLeft').html("");
            loadNextTask();
            //   setTimeout(() => $('#tHalf').html(""), 2000);  // clear the message after 2 seconds
            //   setNewTaskInterval();
        } */
    }
    else {
        msgColor ='red';
        resultMSG=innerHTML=result[0].Notes;
        windowLog.trace(result[0].Notes);
    }
    $("#returnMsg").css({'font-size':   '13px',
                         'color'    :    msgColor});
    $("#returnMsg").html(resultMSG);
}

function displayContractorJobsResults(projectNumber,targetDisplay) {
   
    const screen_name="Sub Contractors";
    windowLog.trace("Inside "+screen_name);
    let out = "";   
    var tabI=1;
    let cArray=[];
    var sumofCntrJobs =0;
   
    if (classArray[screen_name].arr.length) {
        if ( projectNumber == 0 ) // work with all rojects
            cArray = classArray[screen_name].arr;
        else
            cArray = classArray[screen_name].arr.filter(((element) => element.project_number == projectNumber)); 
    }

    const length=cArray.length;

    if (targetDisplay == "#result-table1") {	// Only update the screen name if employee-jobs is displayed in the top screen
        $("#screen_name").html(screen_name);
        lastScreen=screen_name;
    }
    
    prepareDisplay(targetDisplay);
    
    if (length == 0) {
        $(targetDisplay).html("<br><br>No records to show");
        $(targetDisplay).css({'font-size' 	: '13px',
                              'color' 		: 'red'});
    }
    else { 
        document.getElementById("result-table3").hidden=false;
        if (targetDisplay == "#result-table1") // if the targetDisplay is not the main then do not show the project number
            out += `<thead id="mainHeader"><tr><th></th><th class="pmClass">Project Number</th>`; 
        else
            out += `<table class="res_table2" id="result-table"><thead><tr>`;
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        for (var i = 0; i < length; i++) { //loop throu the return msg 
            let  fileUpload="0";
            fileupload=uploadFilesMngr(Number(cArray[i].file_uploaded),(cArray[i].project_number != ""));
            outFiles = `<td>${fileupload}</td>`;

            if ( targetDisplay == "#result-table1" ) {
                    out += `<tr>`;
                    out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
                    out += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" size="44" maxlength="50" value="${cArray[i].project_number}">`;
                    out += `<input type="hidden" id="${headers[$("#screen_name").html()]['primaryKey']}" name="taskID" value=${cArray[i].task_id}></td>`;
                    out += `<td><input tabindex="0" type="text" id='ContractorNameID' name="ContractorName" class="projectNameClass" value="${cArray[i].contractor_name}" size="20"></td>`;
                    out += `<td><input tabindex="0" type="date" id="jobDateID" name="jobDate" class="inputDate" value=${cArray[i].job_date}></td>`;
                    if ( cArray[i].payment_amount != 0.00)
                        out += `<td><input tabindex="0" type="text" id="pymntID" name="payment" class="projectNameClass" value="${cArray[i].payment_amount}"></td>`;
                    else
                        out += `<td><input tabindex="0" type="text" id="pymntID" name="payment" class="projectNameClass" value=""></td>`;

                    out += `<td><input tabindex="0" type="text" id="chkNmbrID" name="checknumber" class="projectNameClass" maxlength="20" value="${cArray[i].checknumber_cnf}"></td>`;
                    out += `<td><input tabindex="0" type="date" id="jobPymntDateID" name="jobPaymentDate" class="inputDate" value=${cArray[i].date_paid}></td>`;
                    out += `<td><input tabindex="0" type="text" id="cjDscrptnID" name="cDscrptn" class="projectNameClass" maxlength="40" value="${cArray[i].description}"></td>`;
                    fileupload=uploadFilesMngr(Number(cArray[i].file_uploaded),(cArray[i].project_number != ""));
                    out += `<td>${fileupload}</td>`;
                    out += `</tr>`;
                    if ( cArray[i].payment_amount != "" )
                        sumofCntrJobs += Number(cArray[i].payment_amount);
            } 
            else { // called with table3
                    out += `<tr>`;
                    out += `<td>${cArray[i].contractor_name}</td>`;
                    out += `<td>${cArray[i].job_date}</td>`;
                    out += `<td>${cArray[i].payment_amount}</td>`;
                    out += `<td>${cArray[i].checknumber_cnf}</td>`;
                    out += `<td>${cArray[i].date_paid}</td>`;
                    out += `<td>${cArray[i].description}</td>`;
                    out += `<td style="width:2%">${fileUpload}</td>`;
                    out += `</tr>`;
            
            }
        }       
        out += `</tbody></table>`;
        
        document.querySelector(targetDisplay).innerHTML = out+`</tbody>`; // print to screen the return messages
        
        if (targetDisplay == "#result-table1") {
            currCell = $('#result-table1 tbody tr:last td:eq(1)').first(); // currCell points to 1st TD in the last TR
            setCellFocus();
            tableSummary(length,sumofCntrJobs);
        }
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"))
    }
    return false;
} 

function displayPurchaseResults(projectNumber,targetDisplay) {
    
    const screen_name="Purchases";
    windowLog.trace("Inside "+screen_name);
    //var t_files2show="";
    let out = "";
    var tabI=1;
    let pArray=[];
    var sumOfInvoices =0;

    if (classArray[screen_name].arr.length) {
        if ( projectNumber == 0 ) 
            pArray = classArray[screen_name].arr;
        else 
            // filter only the records of the project number
            pArray=classArray[screen_name].arr.filter(((element) => element.project_number == projectNumber)); 	
    }
    const length=pArray.length;

    if ( targetDisplay == "#result-table1" ) { // Only  update the screen name if employee-jobs is displayed in the top screen
        $("#screen_name").html(screen_name);
        lastScreen=screen_name;
    }
    
    prepareDisplay(targetDisplay);

    if (length == 0) {	// No records
       
        $(targetDisplay).html("<br><br>No records to show");
        $(targetDisplay).css({'font-size' : '13px',
                              'color'     : 'red'});
    }
    else {
        if (targetDisplay == "#result-table1") {
            out +=`<thead id="mainHeader"><tr><th></th><th class="pmClass">Project Number</th>`; 
            DelCounter=length;
        }
        else
            out += `<table class="res_table2" id="result-table"><thead><tr>`;
        
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        
        for (var i = 0; i < length; i++) { //loop throu the return msg starting from 1 since entry 0 holds the return msg
            fileupload=uploadFilesMngr(Number(pArray[i].file_uploaded),(pArray[i].project_number != ""));
            outFiles = `<td>${fileupload}</td>`;
            if ( targetDisplay == "#result-table1" ) {
                out += `<tr>`;
                out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
                out += `<td><input tabindex="0" type="text" id="prjctNumberID" name="projectNumber" class="projectNameClass" size="44" maxlength="50" value="${pArray[i].project_number}">`;
                //out += `<input type="hidden" id="invoiceID" name="invoiceID" value=${pArray[i].invoice_id}></td>`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="invoiceID" value=${pArray[i].invoice_id}></td>`;
                out += `<td><input tabindex="0" type="text" id="vendorNameID" name="vendorName" class="projectNameClass" value='${pArray[i].vendor_name}'></td>`;
                out += `<td><input tabindex="0" type="text" id="invceNmbrID" name="invoiceNumber" class="projectNameClass" maxlength="40" value=${pArray[i].invoice_number}></td>`;
                out += `<td><input tabindex="0" type="text" id="invceAmtID" name="invoiceAmount" class="projectNameClass" value=${pArray[i].invoice_amount}></td>`;
                out += `<td><input tabindex="0" type="date" id="invoiceDateID" name="invoiceDate" class="inputDate" value=${pArray[i].invoice_date}></td>`;
                out += `<td><input tabindex="0" type="text" id="invoiceMthdID" name="invoiceMethod" class="projectNameClass" value='${pArray[i].payment_method}'></td>`;
                out += `<td><input tabindex="0" type="text" id="invcDscrptnID" name="Description" class="projectNameClass" maxlength="40" value='${pArray[i].invoice_desc}'></td>`;
                out += outFiles+`</tr>`;
                if ( pArray[i].invoice_amount != "")
                    sumOfInvoices += Number(pArray[i].invoice_amount);
            }
            else {	// display is the project summary
                out += `<td>${pArray[i].vendor_name}</td>`;
                out += `<td>${pArray[i].invoice_number}</td>`;
                out += `<td>${pArray[i].invoice_amount}</td>`;
                var jsDate=sql2JSDate(pArray[i].invoice_date,0);
                out += `<td>${jsDate}</td>`;
                out += `<td>${pArray[i].payment_method}</td>`;
                out += `<td>${pArray[i].invoice_desc}</td>`;
                out += outFiles+`</tr>`;
            }
        }    
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML=out+`</tbody>`; // print to screen the return messages
        
        if (targetDisplay == "#result-table1") {
            currCell = $('#result-table1 tbody tr:last td:eq(1)').first();
            setCellFocus();
            tableSummary(length,sumOfInvoices);
        }
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"));
    }
    return false;
}	

function initConfig(data) {

    appConfig.initGlobalSettings(data);	// initialize the configuration class
    
   
    switch (data[1].debug_level) {
        case 'OFF'		:	windowLog.setLevel(Log4js.Level.OFF); 	//	nothing is logged
            break;
        case 'FATAL'	:	windowLog.setLevel(Log4js.Level.FATAL); //	fatal errors are logged
            break;
        case 'ERROR'	:  	windowLog.setLevel(Log4js.Level.ERROR);	//	errors are logged
            break;
        case 'WARN'		:  	windowLog.setLevel(Log4js.Level.WARN);  //	warnings are logged
            break;
        case 'INFO'		:  	windowLog.setLevel(Log4js.Level.INFO);	//	infos are logged
            break;
        case 'DEBUG'	:  	windowLog.setLevel(Log4js.Level.DEBUG);	//	debug infos are logged
            break;
        case 'TRACE'	:  	windowLog.setLevel(Log4js.Level.TRACE);	//	traces are logged
            break;
        case 'ALL'		:  	windowLog.setLevel(Log4js.Level.ALL);	 //
            break;
        default:
            windowLog.setLevel(Log4js.Level.OFF);
    }
    windowLog.addAppender(new Log4js.ConsoleAppender(false)); //to windowLog to seperate windowLog window
    windowLog.trace("Setup debug level:"+data[1].debug_level); 
}

function myOverFPrjctNmbr(e) {
    windowLog.trace("inside mouse over");
}

function sql2JSDate(sqlDate,format) { // format: 0: MM-DD-YYYY 1: YYYY-MM-DD  (for date input field only)
    var dateParts=(sqlDate).split("-");

    if (format) 
        return dateParts[0]+'-'+dateParts[1]+'-'+dateParts[2].substring(0,2); 	// YYYY-MM-DD
    else	
        return dateParts[1]+'-'+dateParts[2].substring(0,2)+'-'+dateParts[0];   // MM-DD-YYYY
}

function home()	{

    const date=new Date();
    
    today=date.getFullYear()+"-"+(("0" + (date.getMonth() + 1)).slice(-2))+"-"+(("0" + date.getDate()).slice(-2)); 
    windowLog.trace("Inside home:today-"+today);
    
    $("#screen_name").html("home");
    $("#screen_name, #addSingleRec,#editDiv").hide();
    $(".scrollit").hide();
    $(".grid-gallery").css({'display' : "none"});
    $(".main_menue").css({'background-color'    : '#faba0a'});
    $("#editLabelID, #formModeID, #exportDialogueID").remove();
    $(".main_menue").show();
    $("#ul, #ur, #ll, #lr").removeClass("configScreen");
    $("#ul, #ur, #ll, #lr").addClass("homeScreen");
    
    if (lastScreen == "Scheduler") { // if the last screen was Scheduler than restore default
        $("#newTaskShortCutID").invisible();
        document.getElementById('result-table').id = 'result-table1';
       
        $("#result-table1").removeClass("tbl_schedule");
        $("#result-table1").removeClass("res_table");
        $("#result-table1").addClass("outer-table");
        $(".res_table1 thead th:first-child").css({'width':'22px'});
    }
    lastScreen="Home";
    document.getElementById("result-table1").hidden=true;
    $("#centercellID").visible();
    //if ( !pageAccessedByReload )
    displayMainMenue("home");
    $('.uList').text("");
    $('#exportID,#result-table1,#postScrollit').html(" ");
    $('#main-menue,#innerCellID,#newProject,#tHalf,#bHalf,#customers').show();
    $("#prjShortCut").focus();
    //$("#rootID").html("Configuration");
   
    charactersCount=0; // reset the coutner
    editing=false;
}

function welcomeBanner() {

    var ctx = document.querySelector("canvas").getContext("2d"),
    dashLen = 220, dashOffset = dashLen, speed = 13,
    txt = "Welcome to Y9v2", x = 0, i = 0;

    ctx.font = "35px Comic Sans MS, sans-serif"; 
    ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.globalAlpha = 2/3;
    ctx.strokeStyle = ctx.fillStyle = "#faba0a";
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    (function loop() {
        
        ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]); // create a long dash mask
        dashOffset -= speed;                                         // reduce dash length
        ctx.strokeText(txt[i], x, 100);                               // stroke letter

        if (dashOffset > 0) 
            requestAnimationFrame(loop);             // animate
        else {
            ctx.fillText(txt[i], x, 100);                               // fill final letter
            dashOffset = dashLen;                                      // prep next char
            x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
            ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());        // random y-delta
            ctx.rotate(Math.random() * 0.005);                         // random rotation
            if (i < txt.length) 
                requestAnimationFrame(loop);
        }
    })(windowLog.trace("Nothing"));
}


// making the table sortable
function AddingSort() {

    const table = document.querySelector('#result-table1'); //get the table to be sorted

    table.querySelectorAll('th') // get all the table header elements
    .forEach((element, columnNo)=>{ // add a click handler for each 
        element.addEventListener('click', event => {
            sortTable(table, columnNo); //call a function which sorts the table by a given column number
        })
    })		
}

function sortTable(table, sortColumn) {
    // get the data from the table cells
    const tableBody = table.querySelector('tbody')
    const tableData = table2data(tableBody);
    // sort the extracted data
    tableData.sort((a, b)=>{
        if(a[sortColumn] > b[sortColumn]){
        return 1;
        }
        return -1;
    })
    // put the sorted data back into the table
    data2table(tableBody, tableData);
}

// this function gets data from the rows and cells 
// within an html tbody element
function table2data(tableBody) {
    const tableData = []; // create the array that'll hold the data rows
    tableBody.querySelectorAll('tr')
        .forEach(row=>{  // for each table row...
        const rowData = [];  // make an array for that row
        row.querySelectorAll('td')  // for each cell in that row
            .forEach(cell=>{
            rowData.push(cell.innerText);  // add it to the row data
            })
        tableData.push(rowData);  // add the full row to the table data 
        });
    return tableData;
}

// this function puts data into an html tbody element
function data2table(tableBody, tableData) {
tableBody.querySelectorAll('tr') // for each table row...
    .forEach((row, i)=>{  
    const rowData = tableData[i]; // get the array for the row data
    row.querySelectorAll('td')  // for each table cell ...
        .forEach((cell, j)=>{
        cell.innerText = rowData[j]; // put the appropriate array element into the cell
        })
    });
}


/*function sortTable(table, sortColumn) {
    // get the data from the table cells
    const tableBody = table.querySelector('tbody')
    const tableData = table2data(tableBody);
    // sort the extracted data
    tableData.sort((a, b)=>{
        if(a[sortColumn] > b[sortColumn]){
        return 1;
        }
        return -1;
    })
    // put the sorted data back into the table
    data2table(tableBody, tableData);
}*/

// this function gets data from the rows and cells 
// within an html tbody element
function table2data(tableBody) {
    const tableData = []; // create the array that'll hold the data rows
    tableBody.querySelectorAll('tr')
        .forEach(row=>{  // for each table row...
        const rowData = [];  // make an array for that row
        row.querySelectorAll('td')  // for each cell in that row
            .forEach(cell=>{
            rowData.push(cell.innerText);  // add it to the row data
            })
        tableData.push(rowData);  // add the full row to the table data 
        });
    return tableData;
}

// this function puts data into an html tbody element
function data2table(tableBody, tableData) {
tableBody.querySelectorAll('tr') // for each table row...
    .forEach((row, i)=>{  
    const rowData = tableData[i]; // get the array for the row data
    row.querySelectorAll('td')  // for each table cell ...
        .forEach((cell, j)=>{
        cell.innerText = rowData[j]; // put the appropriate array element into the cell
        })
    });
}

/*function sortTable(table, sortColumn) {
    // get the data from the table cells
    const tableBody = table.querySelector('tbody')
    const tableData = table2data(tableBody);
    // sort the extracted data
    tableData.sort((a, b)=>{
        if(a[sortColumn] > b[sortColumn]){
        return 1;
        }
        return -1;
    })
    // put the sorted data back into the table
    data2table(tableBody, tableData);
}
*/
// this function gets data from the rows and cells 
// within an html tbody element
function table2data(tableBody) {
    const tableData = []; // create the array that'll hold the data rows
    tableBody.querySelectorAll('tr')
        .forEach(row=>{  // for each table row...
        const rowData = [];  // make an array for that row
        row.querySelectorAll('td')  // for each cell in that row
            .forEach(cell=>{
            rowData.push(cell.innerText);  // add it to the row data
            })
        tableData.push(rowData);  // add the full row to the table data 
        });
    return tableData;
}

// this function puts data into an html tbody element
function data2table(tableBody, tableData) {
tableBody.querySelectorAll('tr') // for each table row...
    .forEach((row, i)=>{  
    const rowData = tableData[i]; // get the array for the row data
    row.querySelectorAll('td')  // for each table cell ...
        .forEach((cell, j)=>{
        cell.innerText = rowData[j]; // put the appropriate array element into the cell
        })
    });
}

// this function gets data from the rows and cells 
// within an html tbody element
function table2data(tableBody) {
    const tableData = []; // create the array that'll hold the data rows
    tableBody.querySelectorAll('tr')
        .forEach(row=>{  // for each table row...
        const rowData = [];  // make an array for that row
        row.querySelectorAll('td')  // for each cell in that row
            .forEach(cell=>{
            rowData.push(cell.innerText);  // add it to the row data
            })
        tableData.push(rowData);  // add the full row to the table data 
        });
    return tableData;
}

// this function puts data into an html tbody element
function data2table(tableBody, tableData) {
tableBody.querySelectorAll('tr') // for each table row...
    .forEach((row, i)=>{  
    const rowData = tableData[i]; // get the array for the row data
    row.querySelectorAll('td')  // for each table cell ...
        .forEach((cell, j)=>{
        cell.innerText = rowData[j]; // put the appropriate array element into the cell
        })
    });
}

function logout() {

    Cookies.remove("username");
    window.open("login.html","_self");
}

/*
function checkOrientation() {

    let retOrientation;

    if ( window.innerWidth > window.innerHeight ) 
        retOrientation = 'landscape';
    else 
        retOrientation = 'portrait';

    windowLog.trace("Inside checkOrientation:"+retOrientation);    
    return retOrientation;
}
*/


    function OnContextResized() {

        windowLog.trace("Window HxW:"+window.innerHeight+":"+window.innerWidth);
        
        if ( ( window.innerHeight > 480 ) && 
            ( window.innerWidth > 480 ) ) {
                if ( !isZoom ) {
                    zoom(1); 
                    $("#footer").css({'font-size' : '10px'});
                    isZoom = true; 
                    windowLog.trace("Zoom In");
                }
            }
            else {
                if ( isZoom ) {
                    zoom(0.8); 
                    $("#footer").css({'font-size' : '7px'});
                    isZoom = false; 
                    windowLog.trace("Zoom out");
                }
            }

        /*if ( window.matchMedia("(orientation: portrait)").matches ) {
            //   windowLog.trace("protrait");
            tempOrient = "portrait";
        }
        else
            if ( window.matchMedia("(orientation: landscape)").matches ) {
                //windowLog.trace("Landscape");
                tempOrient = "landscape";
            }
    
        if ( tempOrient !== _orientation ) {
        _orientation = tempOrient;   // update the new orientation 
            windowLog.trace("new Orientaton:"+ _orientation);
            if (  _orientation == 'portrait') {
                zoom(1);
                $("#footer").css({'font-size' : '10px'});
            }
            else {
                zoom(0.5);  // landscape
                $("#footer").css({'font-size' : '7px'});
            }
        }*/
    }

    window.addEventListener("resize", OnContextResized);

    $( "#footer" ).on( "dblclick", function(event) {

        var out="";
        event.preventDefault();
        const aboutDialog=document.getElementById("aboutDialog");
        out += "<center><br><p>About me</p><center><br>";   
        out += "<p>db_version:"+appConfig.db_version+"</p>";
        out += "<p>lastMdfyFile:"+appConfig.lastMdfyFile+"</p>";
        out += "<p>lastMdfyFile Date:"+appConfig.lastMdfyDate+"</p><br>";
        //const json={'loginID':-1};	            // called read_login ith -1 to retreive the last login     
        //var ret_post=$.post( "../main/read_logins.php",JSON.stringify(json));
        //ret_post.done(function(result) {
        // const lastLoginTime=JSON.parse(result).lastLoginTime;
            //windowLog.trace("lastLoginTime:"+lastLoginTime);
            //out += "<p>Last Login:"+lastLoginTime+"</p><br>";
        out += `<center><input type="button" value="Ok" onclick="return okAboutDateDlg(event)";><center><br>`;
        aboutDialog.innerHTML=out;
        aboutDialog.showModal();

    });

    function okAboutDateDlg(event) {
        const aboutDialog = document.getElementById("aboutDialog");
        aboutDialog.close();
    }

    function tableSummary(length,total)   {

        var out=`<table style="padding: 0;width: 94%;display: flex;align-items: end;justify-content: flex-end;justify-items: center;margin: 0 auto;">`;
            out += `<tr><td style="text-align:right"><a id="totalCountLabel">Total Number of Records:</a></td><td style="width:50px;text-align:right"><a id="totalCount"></a></td></tr>`;
            out += `<tr><td style="text-align:right"><a id="totalAmountLabelID">Total amount:</a></td><td style="width:50px;text-align:right"><a id="totalAmountID"></a></td></tr></table>`;

        const total2 = total.toFixed(2);
        $("#postScrollit").append(out);
        $("#totalCountLabel,#totalCount,#totalAmountID,#totalAmountLabelID").css({'font-size' 	: '13px'});
        $("#totalCount,#totalAmountID").css({'font-weight' 	: 'bold'});
        //$("#totalCountLabel").html();
        $("#totalAmountID").html("$"+total2.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
        $("#totalCount").html(length);
    }


/*

<div id="announcement-bar">
  <p>Whats new in version 2.2.4</p>
  <button id="close-announcement">Close</button>
</div>

// CSS styling (style.css)
#announcement-bar {
  background-color: #f8f8f8;
  color: #333;
  padding: 10px;
  text-align: center;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

#close-announcement {
  float: right;
  background: none;
  border: none;
  cursor: pointer;
}

// JavaScript functionality (script.js)
const announcementBar = document.getElementById('announcement-bar');
const closeButton = document.getElementById('close-announcement');

closeButton.addEventListener('click', () => {
  announcementBar.style.display = 'none';
}); */