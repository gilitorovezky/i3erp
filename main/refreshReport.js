    function refreshReportCallBack() {

        windowLog.trace("Inside refreshReportCallBack");
    
        const sentData=JSON.stringify(Tasks.toJSON(Tasks.noneClosedDailyTasks)); // convert the associative array into regular array before JSON it
        var ret_post=$.post( "../main/pollingdb.php", sentData);
        ret_post.done(function(result) {
            for (var i=0; i < JSON.parse(result).length; i++) {
                const task_id=Object.keys(JSON.parse(result)[i])[0];
                const newTask_status=Object.values(JSON.parse(result)[i])[0]["status"];
                
                switch ( lastScreen ) {
                    case "Scheduler"        : 
                        var resultT = Tasks.arrTasks.findIndex(t => t.task_id == task_id);
                        if (resultT != -1) {
                            Tasks.arrTasks[resultT].task_status=newTask_status; // update the main tasks array
                            $("#"+Tasks.arrTasks[resultT].inid).css("border", '2px solid '+task_color[newTask_status]);  // color the input border
                            $("#txdiv"+Tasks.arrTasks[resultT].inid.slice(2)).find('textarea[name="schdPrjctDscrptn"]').css("border", '2px solid '+task_color[newTask_status]);  // color the textarea border with the new color
                            Tasks.noneClosedDailyTasks[task_id+"-"]=newTask_status; // update the daily tasks with the new status
                        }
                        if (newTask_status == "closed") { // after close nothing to poll so remove the entry
                            delete Tasks.noneClosedDailyTasks[task_id+"-"];
                            windowLog.trace("Removing "+newTask_status+" from the list");
                            const prj_empl_amount = Object.values(JSON.parse(result)[i])[0]["amount"];
                            
                            entry=Projects.retEntrybyID(Object.values(JSON.parse(result)[i])[0]["prj_number"]); // get thge project entry
                            if (entry != -1)  // just to be on the safe side cause it should not happend
                                Projects.arrProjects[entry].project_total_empl_cost=Number(prj_empl_amount);
                        }
                        break;

                    case "Employee Jobs"    :
                        var resultT = classArray[lastScreen].retEntrybyID(task_id);
                        switch  ( newTask_status ) { // update the signin field
                            case "signin"   :
                                //$('#result-table1 tbody tr:nth-child('+resultT+')').find('[id^="jobSignInTimeID"]')[0].value;
                                windowLog.trace("Updating the signin");
                            break;
                        
                            case "lunchin"  : 
                                //$('#result-table1 tbody tr:nth-child('+resultT+')').find('[id^="lunchSignInTimeID"]')[0].value;
                                windowLog.trace("Updating the lunchin");
                            break;

                            case "lunchout" : 
                                //$('#result-table1 tbody tr:nth-child('+resultT+')').find('[id^="lunchSignOutTimeID"]')[0].value;
                                windowLog.trace("Updating the lunchout");
                            break;

                            case "signout"  :
                                windowLog.trace("Updating the signout"); 
                                //$('#result-table1 tbody tr:nth-child('+resultT+')').find('[id^="jobSignOutTimeID"]')[0].value;
                            break;

                        }
                        break;

                    case "Projects"         :
                        entry=Projects.retEntrybyID(Object.values(JSON.parse(result)[i])[0]["prj_number"]); // get thge project entry
                        if (entry != -1)  // just to be on the safe side cause it should not happend
                            Projects.arrProjects[entry].project_total_empl_cost=Number(prj_empl_amount);
                        break;


                }
                windowLog.trace("Now updating task:"+task_id+" New status:"+newTask_status);
            }
        });
        ret_post.fail(function(result) {
            windowLog.warn("Failed to poll new task");
        });
    }