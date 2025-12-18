// load next task
var isShowed=false;
var IsTaskInProgress=false;


function setNewTaskInterval() {

    windowLog.trace("Set polling new task Interval to "+appConfig.ntPolling_Interval+" minute(s), perform an initial poll");
    loadNextTask();
    var refreshId = setInterval(function() {
        if ( currentWorkingTask.taskStatus == 0 ) // no point to poll for new task if task is n signin or signout status
            loadNextTask();
        else
            windowLog.trace("A task in progress - skip read new task");
    }, appConfig.ntPolling_Interval*1000*60);
    currentWorkingTask.timer=refreshId;
}

function loadNextTask() {
        
    windowLog.trace("Poll for new task(s) for eID:"+eID);
   
    const json={'calltype':'nextTask','employee_id':eID};	// set the parqmteres to sent to the server        
    var ret_post=$.post( "../main/load_task.php", JSON.stringify(json));
    ret_post.done(function(result) {
        
        if ( JSON.parse(result)[0].Status == 'fail' ) {     // In case of calltype Employee, Status options are open, signin, fail and dual 
            windowLog.warn(JSON.parse(result)[0].Notes);
            /*if ( ( typeof classArray["Persmissions"][2] != "undefined") &&
                    ( classArray["Persmissions"][2] == true) ) {
                centerMsg="Projects";
                $('#centerTXT').html(centerMsg);
                $('#centerTXT').addClass("nextTask");
                $('#centerTXT').addClass("css-3d-text");
                    //$("#centerTXT").unbind("click");    // disable any further clicks
                    //$("#centerTXT").on( "click", function() {
                    //    windowLog.trace("Register click to centerText");
                    //    displayProjects(username);
                    //});
                $('#centerTXT').show();
            }*/
        }
        else {
            isShowed=true;
            var ulMsg,centerMsg;
            switch  ( JSON.parse(result)[0].Status ) {

                case "open"     :   // only open found, enable signin
                
                    if ( currentWorkingTask.jobProgress == "" ) {   // if already in open then do nothing
                        windowLog.trace("Found new open task:"+Number(JSON.parse(result)[1].task_id));
                        currentWorkingTask.jobProgress = "open";
                        //centerMsg='<a class="css-3d-text" style="">Next Task</a>';//"Next Task";
                        $('#bHalf').removeClass("taskResult");
                        //$('#centerTXT').addClass("nextTask");
                        //$('#centerTXT').addClass("css-3d-text");
                        nextTask();
                        /*$("#centerTXT").unbind("click");    // disable any further clicks
                        windowLog.trace("Register click to centerText");
                        $("#centerTXT").on( "click", function() {
                            windowLog.trace("Click on centerText");
                            //nextTask(event);
                            //loadNextTask();
                        });*/
                        //currentWorkingTask.taskStatus=1;
                        currentWorkingTask.task_id=Number(JSON.parse(result)[1].task_id);   // update the task_id
                        clearInterval(currentWorkingTask.timer); // reset the polling timer till task is closed
                    }
                break;
                
                case "signin"   : 
                    if ( currentWorkingTask.jobProgress != "signin" ) {   // if already in signin then do nothing
                        windowLog.trace("New task found-task_id:"+JSON.parse(result)[1].task_id+" Project number:"+JSON.parse(result)[1].project_number);
                        currentWorkingTask.task_id=JSON.parse(result)[1].task_id;
                        currentWorkingTask.prjName=JSON.parse(result)[1].project_number;
                        currentWorkingTask.prjName=JSON.parse(result)[1].project_name;
                        currentWorkingTask.description=JSON.parse(result)[1].task_description;
                        currentWorkingTask.taskSignInTime=JSON.parse(result)[1].signin;
                        currentWorkingTask.taskLunchSignInTime=JSON.parse(result)[1].lunchin;
                        currentWorkingTask.project_address=JSON.parse(result)[1].project_address;
                        currentWorkingTask.taskStatus = 1;
                        ulMsg="Lunch In";
                        $("#upperRight").html("Sign Out");
                    }
                case "dual"      :  // Both Open and signin tasks found, look for the signin, enable lunch in
                    if ( JSON.parse(result)[0].Status == "dual" ) {
                        const item = JSON.parse(result).find(function(item) {
                            return item.task_status == "signin"; // return the signin item
                        });
                        currentWorkingTask.task_id=item.task_id;
                        currentWorkingTask.prjNumber=item.project_number;
                        currentWorkingTask.description=item.task_description;
                        //$("#centerTXT").unbind( "click" );
                    }
                    currentWorkingTask.jobProgress="signin";
                    currentWorkingTask.showDescription();
                    $('#upperLeft').html(ulMsg);
                    $('#upperLeft').show();
                    $('#upperRightQuadrant').show();	// show the Sign out plus upload files
                    currentWorkingTask.taskStatus = 1;
                break;

                case "lunchin"   : 
                    windowLog.trace("Task found-task_id:"+JSON.parse(result)[1].task_id+" Project number:"+JSON.parse(result)[1].project_number);
                    currentWorkingTask.task_id=JSON.parse(result)[1].task_id;
                    currentWorkingTask.prjNumber=JSON.parse(result)[1].project_number;
                    currentWorkingTask.description=JSON.parse(result)[1].task_description;
                    currentWorkingTask.taskSignInTime=JSON.parse(result)[1].signin;
                    currentWorkingTask.taskLunchSignInTime=JSON.parse(result)[1].lunchin;
                    currentWorkingTask.taskStatus = 2;
                    ulMsg="Lunch Out";
                    currentWorkingTask.showDescription();
                    $('#upperLeft').html(ulMsg);
                    $('#upperLeft').show();
                    currentWorkingTask.jobProgress="lunchin";
                break;

                case "lunchout"   : 
                    $('#upperRightQuadrant').show();
                    windowLog.trace("Task found-task_id:"+JSON.parse(result)[1].task_id+" Project number:"+JSON.parse(result)[1].project_number);
                    currentWorkingTask.task_id=JSON.parse(result)[1].task_id;
                    currentWorkingTask.prjNumber=JSON.parse(result)[1].project_number;
                    currentWorkingTask.description=JSON.parse(result)[1].task_description;
                    currentWorkingTask.taskSignInTime=JSON.parse(result)[1].signin;
                    currentWorkingTask.taskLunchSignInTime=JSON.parse(result)[1].lunchin;
                    currentWorkingTask.taskStatus = 2;
                    currentWorkingTask.showDescription();
                    currentWorkingTask.jobProgress="lunchout";
                    ulMsg="";

                break;
            }
            $('#centerTXT').html(centerMsg);
            $('#centerTXT').show();
        }
    });
    ret_post.fail(function(result) {
            windowLog.warn("Failed to poll new task");
    });
}
