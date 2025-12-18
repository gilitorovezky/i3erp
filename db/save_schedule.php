<?php
    require_once "db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");

    //require_once ('../misc/email.php');
    $tasks_array = array();
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    if ( !isset($_POST["postSchedule"]) ) { 
        file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule.php) ".$current_time." error 1:No postSchedule set, exiting\n", FILE_APPEND);
        $ret_recs=array("Status"            => -1,
                        "new_vendor_name"   => "No postSchedule set");
    } else 
    if ( mysqli_connect_errno() == 0 ) { // no error from the DB
        $post_body=$_POST["postSchedule"]; 
        if ($countPost=count($post_body) > 0) { // just a precaution that a data was sent is not empty
            //$minDate=$post_body[1]['minDate'];
            //$maxDate=$post_body[1]['maxDate'];
            //file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 2-minDate:".$minDate." maxDate:".$maxDate." totalBody:".count($post_body)."\n", FILE_APPEND);
            file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 2-totalBody:".count($post_body)."\n", FILE_APPEND);
            $index=1;   // index to the return array. Start at 1 since entry 0 reserved for return code
            //for ($i = 0; $i < count($post_body)-1; $i++) { // loop over the records
                //var_dump($post_body[$i]);
            $eName=$post_body[0]['Employee'];
            $eID=$post_body[0]['employeeID'];
            $rate=$post_body[0]['rate'];

            $rCounter=count($post_body[0]['Record']);
            
            file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 3.9-".print_r($post_body[0]['Record'],true)."n", FILE_APPEND); 
            file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 4-Name:".$eName." eID:".$eID." , employee_recs count:".$rCounter." index:".$index."\n", FILE_APPEND); 

            // Loop throu the tasks per employee
            for ($rec = 0; $rec < $rCounter; $rec++) { // go over all the records
                $prjDesrc=$post_body[0]['Record'][$rec]['description'];
                $prjName=str_replace("'","\'",$post_body[0]['Record'][$rec]['projectName']); // escaping the field to support ' and "
                $prjNumber=$post_body[0]['Record'][$rec]['projectNumber'];
                $task_date=$post_body[0]['Record'][$rec]['date'];
                $input_id=$post_body[0]['Record'][$rec]['input_id'];
                $task_id=intval($post_body[0]['Record'][$rec]['task_id']);
                $assignmentFlag=$post_body[0]['Record'][$rec]['is_assigned']; // 1 if assigned, 0 if not
                $seq_number=$post_body[0]['Record'][$rec]['seq_number'];
                $file_uploaded=$post_body[0]['Record'][$rec]['file_uploaded']; // 1 if file uploaded, 0 if not
                $new_task=$post_body[0]['Record'][$rec]['new_task']; 
                file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 5-Desc:".$prjDesrc." prjName:".$prjName." PrjNmbr:".$prjNumber." Date:".$task_date." task_id:".$task_id." rec_counter:".$rec." seq_number:".$seq_number." inpt_id:".$input_id." newTask:".$new_task."\n", FILE_APPEND);
                if ( $new_task == 'notNew' ) { // not a new task then select the certain fields
                    $sql_st="SELECT task_status,task_date,project_number,create_time from task_list where task_id='$task_id'";
                    if ( $ret=mysqli_query($con,$sql_st) ) {
                        $row=mysqli_fetch_assoc($ret);  
                        $task_status=$row["task_status"];
                        $createTime=$row["create_time"];
                        //if ( $row["project_number"] == $prjNumber )  // in case of new project number then use the new date, otherwise keep the previous date
                        //    $task_date=$row["task_date"];
                        $sql_st="REPLACE INTO task_list SET task_id='$task_id',task_status='$task_status',project_number='$prjNumber',project_name='$prjName',task_description='$prjDesrc',employee_id='$eID',create_time='$createTime',employee_name='$eName',task_date='$task_date',seq_number='$seq_number',is_assigned='$assignmentFlag',file_uploaded='$file_uploaded'";
                    }
                    else {
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time."error 1-failed to execute sql:".$sql_st."\n", FILE_APPEND);
                        $ret_recs[0] = array("Status"  => $ret);   // return false (error)
                    }
                }
                else {   // No task_id (hense new task)then let the DB auto incremeant and set the task_status to be open
                    //$createTime = date('Y-m-d H:i:s');
                    $sql_st="REPLACE INTO task_list SET task_status='open',project_number='$prjNumber',project_name='$prjName',task_description='$prjDesrc',employee_id='$eID',employee_name='$eName',task_date='$task_date',seq_number='$seq_number',is_assigned='$assignmentFlag',file_uploaded='$file_uploaded'";
                }
                file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 5.5-sql_st:".$sql_st."\n", FILE_APPEND);
                if (mysqli_query($con,$sql_st)) {
                    file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 6-Number of inserted row(s):".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    if ( $task_id == 0 ) {// in case new task then retrieve the task_id from the DB to bubblee it up back tp the app
                        $sql_st = "SELECT task_id from task_list where project_name='$prjName' and task_description='$prjDesrc' and employee_id='$eID' and employee_name='$eName' and task_date='$task_date'";
                        if ($row=mysqli_query($con,$sql_st)) {
                            $task=mysqli_fetch_assoc($row);
                            $task_id=$task["task_id"];
                            $ret_recs[$index++] = array("task_id"   =>  $task["task_id"],
                                                        "input_id"  =>  $input_id);
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 7-sql_st:".$sql_st."\ntask_id=".$task_id." input_id:".$input_id."\n", FILE_APPEND);
                        }
                    }
                    // add record to employee_jobs only if hourly rate is > 0 and prjname not empty 06-17
                    if (( $rate > 0 ) && ( $prjName != "" )) {
                        $sql_st="SELECT employee_jobs.task_id from employee_jobs where task_id='$task_id' limit 1"; // look for an existing record in the ej to add or update
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 7.1-Checking if record already exist in ej, sql_st:".$sql_st."\n", FILE_APPEND);
                        if ($row=mysqli_query($con,$sql_st)) {
                            $ejRow=mysqli_fetch_assoc($row);
                            if ( !is_null($ejRow) ) {
                                $ejCount=$ejRow["task_id"];
                                $sql_st="UPDATE employee_jobs SET employee_id='$eID',project_number='$prjName',description='$prjDesrc', employee_fname='$eName',job_date='$task_date' where task_id='$task_id'";
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 8-updaing employee_jobs, sql_st:".$sql_st."\n", FILE_APPEND);
                                if (mysqli_query($con,$sql_st)) 
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 9-update task to employee_jobs successfully\n", FILE_APPEND);
                                else {
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." error 2-failed to update task to employee_jobs\n", FILE_APPEND);
                                    $ret_recs[0] = array("Status"  => 0);   // return false (error)
                                }
                            }
                            else { // row not exist then add a new one
                                $sql_st="REPLACE INTO employee_jobs SET employee_id='$eID',project_number='$prjName',employee_fname='$eName',description='$prjDesrc',job_date='$task_date',task_id='$task_id'";
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 10-insert new record to employee_jobs, sql_st:".$sql_st."\n", FILE_APPEND);
                                if (mysqli_query($con,$sql_st)) 
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 11-Insert new task to employee_jobs successfully\n", FILE_APPEND);
                                else {
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." error 3-failed to insert new task to employee_jobs\n", FILE_APPEND); 
                                    $ret_recs[0] = array("Status"  => 0);   // return false (error)
                                }       
                            }
                        } else {
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." error 4- failed to read ej table\n", FILE_APPEND);
                            $ret_recs[0] = array("Status"  => -4);   // return false (error)
                        }
                    }
                    else {
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." info 12-hourly rate 0 or no project set, no update to employee jobs\n", FILE_APPEND);
                        $ret_recs[0] = array("Status"  => -5);   // return false (error)
                    }
                }
                else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_schedule) ".$current_time." error 5-failed to replace new task to task_list\n", FILE_APPEND);
                    $ret_recs[0] = array("Status"  => -6);   // return false (error)
                }
            }
            //}
            $ret_recs[0] = array("Status"  => 1);   // return true (success)
        }
    }
    else {
        $ret_recs = array("Status" => -2,
                          "Notes"  => "sql error:".mysqli_connect_errno());   // return false (error)
    }
    file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule) ".$current_time." info 13-".print_r($ret_recs,true)."\n", FILE_APPEND);
    closeConnection("save_schedule");
    echo json_encode($ret_recs);
?>