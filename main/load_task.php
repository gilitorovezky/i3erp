<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    file_put_contents('../log/log_'.$logDate.'.log', "(load_task.php) ".$current_time." info 1-inside load_task.php\n", FILE_APPEND); 
    $ret_results=array();
    //$post_body=json_decode($_POST['postData']); // Json decode the msg sent from the client
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);
    $calltype=$sessionJSON['calltype'];
    $openTasks=1;
    $maxTaskID=0; // holds the max task_id
    file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 2-calltype:".$calltype.", sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    if ( mysqli_connect_errno() == 0 ) {
        $today = date('Y-m-d');
        switch  ($calltype) {

            case "scheduler"    :
                $sql_st="SELECT task_id,project_number,project_name,task_description,employee_id,employee_name,task_date,task_status,seq_number,is_assigned,file_uploaded FROM task_list order by task_date, seq_number ASC";
                file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 3-sql st:".$sql_st."\n", FILE_APPEND);
               
            break;
            
            case "employee"     :
                $employeeID=$sessionJSON["employee_id"];
                if ( !is_null($employeeID) ) {
                    $sql_st = "SELECT count(task_status) as count from task_list where employee_id ='$employeeID' and task_status='open' and task_date like '$today%' and project_number > 0";
                    $tasks=mysqli_query($con,$sql_st);
                    $row = mysqli_fetch_assoc($tasks);
                    $openTasks=$row["count"];
                    $ret_results[0] = array("Status"  => "success"); 
                    file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 4-signin count:". $openTasks."\n", FILE_APPEND);
                    if ($openTasks > 0) { // any open task than prepare the SQL 
                        $sql_st="SELECT tl.task_id,prj.project_address,tl.project_number,tl.project_name,tl.task_description,tl.employee_id,tl.employee_name,tl.task_date,tl.task_status, tl.seq_number, tl.file_uploaded FROM task_list tl
                                inner join projects prj on tl.project_number = prj.project_number WHERE tl.employee_id ='$employeeID' and task_status='open' and tl.task_date like '$today%' order by tl.seq_number ASC limit 1";
                        file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 5-sql st:".$sql_st."\n", FILE_APPEND); 
                    }
                    else 
                        $ret_results[0] = array("Status"  => -1, // fail
                                                "Notes"   => "No tasks found");
                }
                else {
                    $ret_results[0] = array("Status"  => -2, // fail
                                            "Notes"   => "eID not set");
                    file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." error 1-eID not set\n", FILE_APPEND); 
                }
            break;

            case "nextTask"     :
                
                if ( isset($sessionJSON["employee_id"]) ) {
                //if ( !is_null($employeeID) ) {
                    $employeeID=$sessionJSON["employee_id"];
                    //if ( $employeeID  != '' ) {
                    // Search todays task in open status for the employee
                    $sql_st = "SELECT task_status from task_list where employee_id = '$employeeID' and task_status not in ('closed') and task_date like '$today%' order by task_date ASC limit 1";
                    file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 6-sql st:".$sql_st."\n", FILE_APPEND); 
                    $tasks=mysqli_query($con,$sql_st);
                    $rows=mysqli_fetch_assoc($tasks);
                    $countOpen=0;
                    $countSignIn=0;
                    if ( mysqli_num_rows($tasks) > 0 ) {
                        $task_status=$rows["task_status"]; 
                        $ret_results[0] = array("Status"    => $task_status,
                                                "Count"     => 1); // set the status to either false (no row found) or true (rows found)
                        file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 8-status:".$task_status."\n", FILE_APPEND); 
                        $sql_st="SELECT tl.task_id,prj.project_address,tl.project_number,tl.project_name,tl.task_description,tl.employee_id,tl.employee_name,tl.task_date,tl.task_status FROM task_list tl
                                        inner join projects prj on tl.project_number = prj.project_number WHERE tl.employee_id = '$employeeID' and task_status='$task_status' and tl.task_date like '$today%' order by tl.seq_number ASC limit 1";
                        file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 8.5-sql_st:".$sql_st."\n", FILE_APPEND); 
                        $openTasks=1;
                    }
                    else {
                        file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 7-No tasks found\n", FILE_APPEND); 
                        $ret_results[0] = array("Status"  => -3, // fail
                                                "Notes"   => "No tasks found");
                        $openTasks=0;
                    }
    
                    // retrieve the earliest open or signin
                    /*$sql_st="SELECT tl.task_id,prj.project_address,tl.project_number,tl.project_name,tl.task_description,tl.employee_id,tl.employee_name,tl.task_date,tl.task_status FROM task_list tl
                                inner join projects prj on tl.project_number = prj.project_number WHERE employee_id = '$employeeID' and task_status = 'signin' and tl.task_date like '$today%' order by tl.seq_number ASC";
                            
                    file_put_contents('../log/log_'.$logDate."-".$employeeID.'.log', "(load_task) ".$current_time." info 9-open count:".$countOpen." SignIn Count:".$countSignIn." sql_st:".$sql_st."\n", FILE_APPEND); */
                }
                else {
                    $ret_results[0] = array("Status"  => -4, // fail
                                            "Notes"   => "eID not set");
                    $openTasks = 0;
                    file_put_contents('../log/log_'.$logDate.'.log', "(load task) ".$current_time." error 2-eID not set\n", FILE_APPEND); 
                }
            break;  

        }
        if ( $openTasks ) {
            $tasks=mysqli_query($con,$sql_st);
            $anyRowCount=$tasks->num_rows; 
            if ( $anyRowCount > 0 ) {
                $i=1;   // start from 1 to keep entry 0 to the return status
                // in case of nextTask only single record is return, if found  
                while ($row = mysqli_fetch_assoc($tasks)) {
                    switch ($calltype) {
                        case "scheduler"    : 
                            $row["project_address"]="";   // no read project_address is scheduler sql
                            $maxTaskID=max($maxTaskID,$row["task_id"]);
                            
                        case "employee"     :
                            $ret_results[$i]=array( "task_id"            =>    $row["task_id"],
                                                    "project_number"     =>    $row["project_number"],
                                                    "project_name"       =>    $row["project_name"],
                                                    "task_description"   =>    $row["task_description"],
                                                    "employee_id"        =>    $row["employee_id"],
                                                    "employee_name"      =>    $row["employee_name"],
                                                    "task_date"          =>    $row["task_date"],
                                                    "task_status"        =>    $row["task_status"],
                                                    "project_address"    =>    $row["project_address"],
                                                    "seq_number"         =>    $row["seq_number"],
                                                    "inid"               =>    0,
                                                    "file_uploaded"      =>    $row["file_uploaded"],
                                                    "is_assigned"        =>    $row["is_assigned"],
                                                );
                            file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 10-Rec Num:".$i." Rec:".print_r($ret_results[$i],true)."\n", FILE_APPEND); 
                        break;

                        case "nextTask"     :
                            $task_id=$row["task_id"];
                            $project_number=$row["project_number"];
                            $task_status=$row["task_status"];
                            $project_name=$row["project_name"];
                            $task_description=$row["task_description"];
                            $rowTemp=[];
                            if ( $task_status == 'signin') {
                                $sql_st = "SELECT job_signin,lunch_signin,lunch_signout,job_progress FROM employee_jobs where task_id = '$task_id'";
                                $task_empl_job=mysqli_query($con,$sql_st);
                                $rowTemp = mysqli_fetch_assoc($task_empl_job);
                            }
                            else {
                                $rowTemp["job_signin"] = "00:00";
                                $rowTemp["lunch_signin"] = "00:00";
                                $rowTemp["job_progress"] = "open";
                            }
                            file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 10.5-signin:".$rowTemp["job_signin"]." lunch signin:".$rowTemp["lunch_signin"]."\n", FILE_APPEND);
                            file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 11-task_id:".$task_id." prj_number:".$project_number." proj name:".$project_name." task_status:".$task_status." tDescription:".$task_description."\n", FILE_APPEND);
                            $ret_results[$i] = array("task_id"          => $task_id,
                                                     "project_number"   => $project_number,
                                                     "project_name"     => $project_name,
                                                     "task_status"      => $task_status,
                                                     "project_address"  => $row["project_address"],
                                                     "task_description" => $task_description,
                                                     "signin"           => $rowTemp["job_signin"],
                                                     "lunchin"          => $rowTemp["lunch_signin"],
                                                     "job_progress"     => $rowTemp["job_progress"]);
                        break;
                    }
                    $i++;
                }
                if ( $calltype == "scheduler" ) {
                    $ret_results[0] = array("Status"    => 1, 
                                            "maxID" => $maxTaskID);
                }
            } 
            else {
                file_put_contents('../log/log_'.$logDate.'.log', "(load task) ".$current_time." error 3-No open or signin tasks found\n", FILE_APPEND); 
                $ret_results[0] = array("Status"  => -5,
                                        "Notes"   => "No tasks found");
            }
        }
    } else {
        $ret_results[0] = array("Status"  => "fail", 
                                "Notes"   => "General Error");
        file_put_contents('../log/log_'.$logDate.'.log', "(load task) ".$current_time." error 2-General error\n", FILE_APPEND);
    }
    mysqli_close($con); // Close DB connection
    file_put_contents('../log/log_'.$logDate.'.log', "(load task) ".$current_time." info 12-maxTaskID:".$maxTaskID."\n", FILE_APPEND);
    echo json_encode($ret_results);             
?>