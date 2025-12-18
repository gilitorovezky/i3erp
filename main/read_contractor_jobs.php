<?php
    // Open DB connection
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
    $ret_recs = array();

    $projectNumber=str_replace("'","\'",$_POST["projectNumber"]); // call type : * or project id
    file_put_contents('../log/log_'.$logDate.'.log', "(contractors_jobs) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()." prjNumber:".$_POST["projectNumber"]."\n", FILE_APPEND); 
    if (isset($projectNumber)) {
        if ( mysqli_connect_errno() == 0 ) {
            if ( $projectNumber =='all' )
                // get all contractors
                $sql_st="SELECT * FROM contractor_jobs order by date_paid ASC";
            else
                // get only the contractors relevant to the project
                $sql_st="SELECT * FROM contractor_jobs where project_number = '$projectNumber' order by job_date ASC";
            file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors_jobs) ".$current_time."info 2-sql st:".$sql_st."\n", FILE_APPEND); 
            $contractors=mysqli_query($con,$sql_st);
            file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors_jobs) ".$current_time."info 3-# of rows:".$contractors->num_rows."\n", FILE_APPEND); 

            // if any records found
            $maxID=1;
            if ($contractors->num_rows >0) {
                $i=1;
                //retrieve records 
                while ($row = mysqli_fetch_assoc($contractors)) { 
                    $maxID=max($maxID,$row["task_id"]);
                    //file_put_contents('../log/log_'.$logDate.'.log', "(read_contractors_jobs) info : ".$current_time." ".$row[0]."\n", FILE_APPEND); 
                    $ret_recs[$i] =  array( "task_id"            => $row["task_id"],
                                            "employee_id"        => $row["employee_id"],     
                                            "project_number"     => $row["project_number"],
                                            "contractor_name"    => $row["contractor_name"],
                                            "description"        => $row["description"],
                                            "payment_amount"     => $row["payment_amount"],
                                            "date_paid"          => $row["date_paid"],
                                            "checknumber_cnf"    => $row["checknumber_cnf"],
                                            "job_date"           => $row["job_date"],
                                            "file_uploaded"      => $row["file_uploaded"],
                                            "images_json"        => $row["images_json"],
                                            "foldername"         => $row["foldername"]);
                    
                    file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors_jobs) ".$current_time." info 4-record #".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
                }
            }
            $ret_recs[0]=array( "Status" => 1,
                                "maxID"  => $maxID);  
            mysqli_close($con);   // Close DB connectin
        } else
            file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors_jobs) ".$current_time." error 1-sql connect err:".mysqli_connect_errno()."\n", FILE_APPEND); 
    }
    else
        $ret_recs[0] = array("Status"  => -1, // fail
                             "Notes"   => "General Error");   
    echo json_encode($ret_recs);
?>