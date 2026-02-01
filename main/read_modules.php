<?php
    // Open DB connection
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(modules.php) ".$current_time." info 1-inside read_modules.php\n", FILE_APPEND); 
    
    if ( mysqli_connect_errno() == 0 ) {
        $sql_st="SELECT module_id,module_name,screen_number,visible,permission,module_file,initial_params FROM modules";
        file_put_contents('../log/log_'.$logDate.'.log', "(read_modules) ".$current_time."info 1-sql st:".$sql_st."\n", FILE_APPEND); 
        $modules=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_modules) ".$current_time."info 2-# of rows:".$modules->num_rows."\n", FILE_APPEND); 

        $maxID=1;
        
        if ( $modules->num_rows >0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($modules)) {   
                $maxID=max($maxID,$row["module_id"]);
                $ret_recs[$i] =  array("module_id"      => $row["module_id"],
                                        "module_name"   => $row["module_name"],
                                        "screen_number" => $row["screen_number"], 
                                        "visible"       => $row["visible"],
                                        "permission"    => $row["permission"],
                                        "module_file"   => $row["module_file"],
                                        "initial_params"=> $row("initial_params"));

                file_put_contents('../log/log_'.$logDate.'.log',"(read_modules) ".$current_time." info 4-".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array("Status" => 1,
                           "maxID"  => $maxID);           
        mysqli_close($con);   // Close DB connectin
    } else {
        file_put_contents('../log/log_'.$logDate.'.log',"(read_modules) ".$current_time." error 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
        $ret_recs[0] = array("Status"  => -1, // fail
                             "Notes"   => "General Error");
        }

    echo json_encode($ret_recs);
?>