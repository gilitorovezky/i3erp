<?php
    require_once "db_connect.php";   
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    ##
    $ret_recs = array("Status" => 1);   

    file_put_contents('../log/log_'.$logDate.'.log', "(delete_task) ".$current_time." info 1-inside delete_task.php, sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        if ($_POST["postData"] != '') { // just to be on the safe side
            $task_id=$_POST["postData"];
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_task) ".$current_time." info 2-task_id:".$task_id."\n", FILE_APPEND);
            $sql_st= "DELETE from task_list WHERE task_id = '$task_id'";
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND);  
            if (mysqli_query($con,$sql_st)) {
                file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                $sql_st= "DELETE from employee_jobs WHERE task_id ='$task_id'";
                file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 5-sql_st:".$sql_st."\n", FILE_APPEND);
                $ret_recs = array("Status"  => 1);
                if (mysqli_query($con,$sql_st)) 
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 6-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                else 
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 1-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
            }
            else {
                file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 2-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                $ret_recs = array("Status"  => -1);
            }
        }  
        else {
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 3 no postData\n", FILE_APPEND);
            $ret_recs = array("Status"  => -2);
        }
        closeConnection("delete_task"); // closse the connection.. function in the db_connect mopdule
    }
    else {
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 4-failed to conenct to the DB\n", FILE_APPEND);
            $ret_recs = array("Status"  => -3);
    }
    
    echo json_encode($ret_recs); // return results
  ?>