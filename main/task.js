// nextTask event Handler
function nextTask() {

    windowLog.trace("Inside nextTask");
    if (currentWorkingTask.taskStatus == 0) { // do nothing if already in signout
        const arrObj={'calltype':'employee','employee_id':eID};	// set the parqmteres to sent to the server
        windowLog.trace("Checking next task for employeeID "+eID);
        $.ajax({
            url			: "../main/load_task.php",
            method		: "POST",
            dataType	: "json",
            async       : false,
            data 		: JSON.stringify(arrObj),
            success		: function(tasks) {
                const numTasks=Object.keys(tasks).length;
                var msg="";
                if (tasks != '') {
                    if ( tasks[0].Status != 'fail' ) {
                        //msg =  `Address:<br>`+`<a id="addressNextTask" style="font-size:13px; color:blue">${tasks[1].project_address} </a><br>`;

                        //let msg = `Description:<br>`+tasks[1].task_description;
                        currentWorkingTask.description=tasks[1].task_description; //msg;
                        currentWorkingTask.project_address=tasks[1].project_address;
                        currentWorkingTask.taskStatus = 1;   // next task is on
                    } 
                    else { // error
                        //document.getElementById("screen_name").hidden=false;
                        msg=tasks[0].Notes;
                        // replace the error message with Next Task after 2 seconds
                        /*setTimeout(() => {
                            $('#centerTXT').html("Next Task");
                            $('#centerTXT').removeClass("taskResult");
                            $('#centerTXT').addClass("nextTask");
                        }, appConfig.saveMsgTimeout);*/
                    }
                    currentWorkingTask.showDescription();
                    $('#upperLeft').html("Sign In");
                    $('#upperLeft').show();	
                }
            }       
        });
    }
    else
        windowLog.trace("task in signin/lunch, do nothing");
}						
