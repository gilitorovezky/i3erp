<?php

    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");

    $ret_recs = array();
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);
    
    $projectNumber=str_replace("'","\'",$sessionJSON['projectNumber']); // projectNumber : all or projectNumber
   
    if (isset($projectNumber)) {
        file_put_contents('../log/log_'.$logDate.'.log',"(read_employee_jobs) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()." prjNumber:".$projectNumber."\n", FILE_APPEND); 
        if ( mysqli_connect_errno() == 0 ) {
            if ( $projectNumber =='all' )
                //$sql_st="SELECT * FROM employee_jobs order by job_date ASC, job_signin ASC";
                $sql_st="SELECT * FROM employee_jobs  
                order 
                    by job_date asc,
                    case when employee_fname = 'jake'  then 1
                         when employee_fname = 'pedro' then 2
                         when employee_fname = 'orel'  then 3
                         when employee_fname = 'dudu'  then 4
                    end ";
            else
                $sql_st="SELECT * FROM employee_jobs where project_number = '$projectNumber' order by job_date ASC, job_signin ASC";
            
            $employee_job=mysqli_query($con,$sql_st);
            file_put_contents('../log/log_'.$logDate.'.log', "(read_employee_jobs) ".$current_time." info 2-sql st:".$sql_st."\n", FILE_APPEND); 
            file_put_contents('../log/log_'.$logDate.'.log', "(read_employee_jobs) ".$current_time." info 3-# of rows:".$employee_job->num_rows."\n", FILE_APPEND); 

            $maxID=1;
            // if any records found
            if ( $employee_job->num_rows > 0 ) {
                $i=1;
                while ($row = mysqli_fetch_assoc($employee_job)) { 
                    $maxID=max($maxID,$row["task_id"]);
                    $ret_recs[$i] =  array("task_id"            =>  $row["task_id"],
                                           "employee_id"        =>  $row["employee_id"],
                                           "project_number"     =>  $row["project_number"],
                                           "employee_fname"     =>  $row["employee_fname"],
                                           "job_date"           =>  $row["job_date"],
                                           "job_signin"         =>  $row["job_signin"],
                                           "lunch_signin"       =>  $row["lunch_signin"],
                                           "lunch_signout"      =>  $row["lunch_signout"],
                                           "job_signout"        =>  $row["job_signout"],
                                           "total_hours"        =>  $row["total_hours"],
                                           "job_closed"         =>  $row["job_closed"],
                                           "file_uploaded"      =>  $row["file_uploaded"],
                                           "images_json"        =>  $row["images_json"],
                                           "description"        =>  $row["description"],
                                           "labor_cost"         =>  $row["labor_cost"],
                                           "submission_type"    =>  $row["submission_type"],
                                           "foldername"         =>  $row["foldername"]);    // A-auto, M-manual by Eyal, u-updated by Eyal after submission 
                    
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_employee_jobs) ".$current_time." info 4-record #:".$i.print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
                }
            }
            $ret_recs[0]=array("Status" => 1,
                               "maxID"  => $maxID);  
             
            mysqli_close($con);   // Close DB connectin
        } else {
            file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors_jobs) ".$current_time." error 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
            $ret_recs[0] = array("Status"  => -1, // fail
                                 "Notes"   => "General Error");
        }
    } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_employee_jobs) ".$current_time." error 1:No Project ID set\n", FILE_APPEND); 
            $ret_recs[0] = array("Status"  => -1, // fail
                                 "Notes"   => "General Error");
        }
    echo json_encode($ret_recs); // return results
  ?>