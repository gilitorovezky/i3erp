<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." info 2-sql conect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);   
    file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." info 2.1:".print_r($sessionJSON,true)."\n", FILE_APPEND);
    
    if ( mysqli_connect_errno() == 0 ) {
        ; // call type : sign in or signout
        if ( isset($sessionJSON['calltype']) ) { 
            $calltype=$sessionJSON['calltype'];
            file_put_contents('../log/log_'.$logDate.'.log',"(read_leads) ".$current_time." info 3-call type:".$calltype."\n", FILE_APPEND);
            if ( $calltype == 'all') {
                $file2upload="";
               
                $sql_st = "SELECT * FROM leads order by lead_id ASC";  // Must be ASC to have the last project number at the last position

                $leads=mysqli_query($con,$sql_st);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND); 
                file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." info 4-# of rows:".$leads->num_rows."\n", FILE_APPEND); 
                $maxID=1;
                // if any records found
                if ( $leads->num_rows > 0 ) {
                    $i=1;
                    while ($row = mysqli_fetch_assoc($leads)) { 
                        $maxID=max($maxID,$row["lead_id"]);
                        $ret_recs[$i] =  array( "lead_id"                =>  $row["lead_id"],
                                                "customer_id"            =>  $row["customer_id"],
                                                "lead_number"            =>  $row["lead_number"],                                                
                                                "lead_notes"             =>  $row["lead_notes"],
                                                "lead_assigner"          =>  $row["lead_assigner"],
                                                "file_uploaded"          =>  $row["file_uploaded"],
                                                "images_json"            =>  $row["images_json"],);
                        file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." info 6-rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND);
                    }
                    $ret_recs[0]=array("Status" => 1,
                                       "maxID"  => $maxID);  // Need to returfor new employeesn 
                } else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." error 3-no records found\n", FILE_APPEND); 
                    $ret_recs[] = array("Status"  => -3, // fail
                                        "Notes"   => "General Error(3)");
                }
            } else { // called by an individual username
                $lead_id=$_POST['calltype'];
                $sql_st = "SELECT * from leads where lead_id = '$lead_id'";
            } 
        } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_leads) ".$current_time." error 4\n", FILE_APPEND); 
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