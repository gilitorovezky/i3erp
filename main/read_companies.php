<?php

    include "../db/db_connect.php"; // Open DB connection

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log', "(read_companies.php) ".$current_time." info 1-inside read_companies.php, sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    
    if ( mysqli_connect_errno() == 0 ) {
        $sql_st="SELECT * FROM companies order by company_id ASC";
        file_put_contents('../log/log_'.$logDate.'.log', "(read_companies) ".$current_time." info 2-sql st:".$sql_st."\n", FILE_APPEND); 
        $companies=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_companies) ".$current_time." info 3-# of rows read:".$companies->num_rows."\n", FILE_APPEND); 

        $maxID=1;
        // if any records found
        if ( $companies->num_rows > 0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($companies)) {
                $maxID=max($maxID,$row["company_id"]);
                $ret_recs[$i] =  array( "company_id"       => $row["company_id"],
                                        "company_name"     => $row["company_name"],
                                        "file_uploaded"    => $row["file_uploaded"],
                                        "images_json"      => $row["images_json"],
                                        "notes"            => $row["notes"]);
                file_put_contents('../log/log_'.$logDate.'.log',"(read_companies) ".$current_time." info 4-record #".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array( "Status" => 1,
                            "maxID"  => $maxID); 
        mysqli_close($con);   // Close DB connectin
    } else {
            file_put_contents('../log/log_'.$logDate.'.log',"(read_companies) ".$current_time." error 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
            $ret_recs[0] = array("Status"  => -1, // fail
                                 "Notes"   => "General Error");
    }

    echo json_encode($ret_recs);
?>