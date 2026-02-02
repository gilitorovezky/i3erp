<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." info 2-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);   
    file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." info 2.1:".print_r($sessionJSON,true)."\n", FILE_APPEND);
    
    if ( mysqli_connect_errno() == 0 ) {
        ; // call type : sign in or signout
        if ( (isset($sessionJSON['calltype']) && ($sessionJSON['calltype'] != '')) ) { 
            $calltype=$sessionJSON['calltype'];
            file_put_contents('../log/log_'.$logDate.'.log',"(read_estimates) ".$current_time." info 3-call type:".$calltype."\n", FILE_APPEND);
            if ( $calltype == 'all') {
                $file2upload="";
               
                $sql_st = "SELECT * FROM estimates order by estimate_id ASC";  // Must be ASC to have the last project number at the last position

                $estimates=mysqli_query($con,$sql_st);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." info 3-insert sql_st:".$sql_st."\n", FILE_APPEND); 
                file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." info 4-# of rows:".$estimates->num_rows."\n", FILE_APPEND); 
                $maxID=1;
                // if any records found
                if ( $estimates->num_rows > 0 ) {
                    $i=1;
                    while ($row = mysqli_fetch_assoc($estimates)) { 
                        $maxID=max($maxID,$row["estimate_id"]);
                        $ret_recs[$i] =  array( "estimate_id"                =>  $row["estimate_id"],
                                                "customer_id"                =>  $row["customer_id"],
                                                "estimate_number"            =>  $row["estimate_number"],
                                                "estimate_first_name"        =>  $row["estimate_first_name"],
                                                "estimate_last_name"         =>  $row["estimate_last_name"],
                                                "estimate_sales_rep"         =>  $row["estimate_sales_rep"],
                                                "estimate_type"              =>  $row["estimate_type"],
                                                "estimate_address"           =>  $row["estimate_address"],
                                                "estimate_name"              =>  $row["estimate_name"],
                                                "estimate_details"           =>  $row["estimate_details"],
                                                "estimate_created_date"      =>  $row["estimate_created_date"], // no need to show the estimate date per Eyal
                                                "estimate_signed_date"       =>  $row["estimate_signed_date"],
                                                "estimate_signed_owner"      =>  $row["estimate_signed_owner"],
                                                "estimate_signed_total"      =>  $row["estimate_total"],
                                                "estimate_discount"          =>  $row["estimate_discount"],
                                                "estimate_notes"             =>  $row["estimate_notes"],
                                                "estimate_reserved"          =>  $row["estimate_reserved"],
                                                "file_uploaded"              =>  $row["file_uploaded"],
                                                "images_json"                =>  $row["images_json"],);
                        file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." info 6-rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND);
                    }
                    $ret_recs[0]=array("Status" => 1,
                                       "maxID"  => $maxID);  // Need to returfor new employeesn 
                } else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." error 3-no records found\n", FILE_APPEND); 
                    $ret_recs[] = array("Status"  => -3, // fail
                                        "Notes"   => "General Error(3)");
                }
            } else { // called by an individual username
                $estimate_id=$_POST['calltype'];
                $sql_st = "SELECT * from estimates where estimate_id = '$estimate_id'";
            } 
        } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_estimates) ".$current_time." error 4\n", FILE_APPEND); 
            $ret_recs[] = array("Status"  => -4, // fail
                                "Notes"   => "General Error(-4)");
        }
    }
    else
        $ret_recs = array("Status"  => 0, // fail
                          "Notes"   => "General Error");
    mysqli_close($con);   // Close DB connectin
    echo json_encode($ret_recs); // return results
?>