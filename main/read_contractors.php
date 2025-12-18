<?php
    // Open DB connection
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(contractors.php) ".$current_time." info 1-inside read_contractors.php\n", FILE_APPEND); 
    
    if ( mysqli_connect_errno() == 0 ) {
        $sql_st="SELECT * FROM contractors order by contractor_id ASC";
        file_put_contents('../log/log_'.$logDate.'.log', "(read_contractors) ".$current_time."info 1-sql st:".$sql_st."\n", FILE_APPEND); 
        $contractors=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_contractors) ".$current_time."info 2-# of rows:".$contractors->num_rows."\n", FILE_APPEND); 

        $maxID=1;
        // if any records found
        if ( $contractors->num_rows >0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($contractors)) {   
                $maxID=max($maxID,$row["contractor_id"]);
                $ret_recs[$i] =  array("contractor_id"   => $row["contractor_id"],                                    
                                        /*"employee_id"    => $row["employee_id"],*/
                                        "name"           => $row["name"],
                                        /*"address1"       => $row["address1"],
                                        "address2"       => $row["address2"],
                                        "zipcode"        => $row["zipcode"],
                                        "city"           => $row["city"],
                                        "state"          => $row["state"],*/
                                        "notes"          => $row["notes"], 
                                        "file_uploaded"  => $row["file_uploaded"],
                                        "images_json"    => $row["images_json"]);

                file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors) ".$current_time." info 4-".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array("Status" => 1,
                            "maxID"  => $maxID);           
        mysqli_close($con);   // Close DB connectin
    } else {
        file_put_contents('../log/log_'.$logDate.'.log',"(read_contractors) ".$current_time." error 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
        $ret_recs[0] = array("Status"  => -1, // fail
                             "Notes"   => "General Error");
        }

    echo json_encode($ret_recs);
?>