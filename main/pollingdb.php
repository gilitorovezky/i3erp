<?php
    // Open DB connection
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
    $ret_recs = array();
    $get_json = file_get_contents('php://input');
    $sessionJSON = json_decode($get_json, true);
    
    $arrLength=count($sessionJSON);
    file_put_contents('../log/log_'.$logDate.'.log',"(read_pollingdb) ".$current_time." info 1-count input array:".$arrLength." ".print_r($sessionJSON,true)."\n", FILE_APPEND); 
    if ( $arrLength > 0) {
        $sql_st= "SELECT task_id,task_status,project_number from task_list where task_id in (";
        foreach ($sessionJSON as $task => $status) { // Go over the row to extract the task_id (iterable as $key => $value)
            $sql_st .= $task ." , ";
            $assArray[$task]=$status; //create associative array for later use
        }

        $sql_st = substr($sql_st, 0, -2); // Remove the last two chars: , and space
        $sql_st.=")";   // add a close dparanthesis
        file_put_contents('../log/log_'.$logDate.'.log', "(pollingdb) ".$current_time." info 2-sql_st:".$sql_st."\n", FILE_APPEND); 
        $result=mysqli_query($con,$sql_st);
        // if any records found
        $counter=0;
        while ($row = mysqli_fetch_assoc($result)) {   // loop over the sql results
            if ( $assArray[$row["task_id"]] != $row["task_status"] ) { // if the task status is different from the DB
               
                file_put_contents('../log/log_'.$logDate.'.log', "(pollingdb) ".$current_time." info 3-change found in ".$row["task_id"]." new status:".$row["task_status"]."\n", FILE_APPEND); 

                // Only in case of closed task, read the employee amount to bubble it up to the app to update project table
                if ( $row["task_status"] == "closed" ) {
                    $sql_st = "SELECT project_total_empl_cost FROM projects where project_number =".$row["project_number"];  // Must be ASC to have the last project number at the last position
                    file_put_contents('../log/log_'.$logDate.'.log', "(pollingdb) ".$current_time." info 4:sql st:".$sql_st."\n", FILE_APPEND); 
                    $project_record=mysqli_query($con,$sql_st);
                    $row2 = mysqli_fetch_assoc($project_record);
                    $ret_recs[$counter]=array($row["task_id"] => array ("status"        => $row["task_status"],
                                                                        "amount"        => $row2["project_total_empl_cost"],
                                                                        "prj_number"    => $row["project_number"])) ;
                    file_put_contents('../log/log_'.$logDate.'.log',"(read_pollingdb) ".$current_time." info 5:".print_r($ret_recs[$counter++],true)."\n", FILE_APPEND); 
                }
                else // no closed so just return the new status
                    $ret_recs[$counter++]=array($row["task_id"] => array ("status"   => $row["task_status"])) ;
            }
            else   
                file_put_contents('../log/log_'.$logDate.'.log', "(pollingdb) ".$current_time." info 4-No change found in ".$row["task_id"]."\n", FILE_APPEND); 
        }
    }
    else
        file_put_contents('../log/log_'.$logDate.'.log', "(pollingdb) ".$current_time." warning 1-empty array\n", FILE_APPEND); 

    mysqli_close($con);   // Close DB connectin
    echo json_encode($ret_recs);
?>