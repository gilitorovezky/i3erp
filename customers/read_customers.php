<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." info 2-sql connect err:".mysqli_connect_errno()."\n", FILE_APPEND); 
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);   
    file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." info 2.1:".print_r($sessionJSON,true)."\n", FILE_APPEND);
    
    if ( mysqli_connect_errno() == 0 ) {
        if ( isset($sessionJSON['calltype']) ) { 
            $calltype=$sessionJSON['calltype'];
            file_put_contents('../log/log_'.$logDate.'.log',"(read_customers) ".$current_time." info 3-call type:".$calltype."\n", FILE_APPEND);
            if ( $calltype == 'all') {
                $file2upload="";
               
                $sql_st = "SELECT * FROM customers order by customer_id ASC";  // Must be ASC to have the last project number at the last position

                $customers=mysqli_query($con,$sql_st);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." info 3-insert sql_st:".$sql_st."\n", FILE_APPEND); 
                file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." info 4-# of rows:".$customers->num_rows."\n", FILE_APPEND); 

                // if any records found
                $maxID=1;
                if ( $customers->num_rows > 0 ) {
                    $i=1;
                    while ($row = mysqli_fetch_assoc($customers)) { 
                        $maxID=max($maxID,$row["customer_id"]);
                        $ret_recs[$i] =  array( "customer_id"               =>  $row["customer_id"],
                                                "customer_number"           =>  $row["customer_number"],
                                                "customer_first_name"       =>  $row["customer_first_name"],
                                                "customer_last_name"        =>  $row["customer_last_name"],
                                                "customer_project_manager"  =>  $row["customer_project_manager"],
                                                "customer_type"             =>  $row["customer_type"],
                                                "customer_address_line1"    =>  $row["customer_address_line1"],
                                                "customer_address_line2"    =>  $row["customer_address_line2"],
                                                "customer_city"             =>  $row["customer_city"],
                                                "customer_state"            =>  $row["customer_state"],
                                                "customer_zip"              =>  $row["customer_zip"],
                                                "customer_details"          =>  $row["customer_details"],
                                                "customer_created_date"     =>  $row["customer_created_date"], // no need to show the customer date per Eyal
                                                "customer_signed_date"      =>  $row["customer_signed_date"],
                                                "customer_signed_owner"     =>  $row["customer_signed_owner"],
                                                "customer_signed_total"     =>  $row["customer_total"],
                                                "customer_discount"         =>  $row["customer_discount"],
                                                "customer_notes"            =>  $row["customer_notes"],
                                                "customer_reserved"         =>  $row["customer_reserved"],
                                                "file_uploaded"             =>  $row["file_uploaded"],
                                                "images_json"               =>  $row["images_json"],
                                                "create_time"               =>  $row["create_time"],
                                                "customer_email"            =>  $row["customer_email"],
                                                "customer_tel_number"       =>  $row["customer_tel_number"],
                                                "isLeads"                   =>  $row["isLeads"],
                                                "isEstimates"               =>  $row["isEstimates"],
                                                "isProjects"                =>  $row["isProjects"]
                                                );
                        file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." info 6-rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND);
                    }
                    $ret_recs[0]=array("Status" => 1,
                                       "maxID"  => $maxID);  // Need to returfor new employeesn 
                } else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." error 3-no records found\n", FILE_APPEND); 
                    $ret_recs[] = array("Status"  => -3, // fail
                                        "Notes"   => "General Error(3)");
                }
            } else { // called by an individual username
                $customer_id=$_POST['calltype'];
                $sql_st = "SELECT * from customers where customer_id = '$customer_id'";
            } 
        } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_customers) ".$current_time." error 4\n", FILE_APPEND); 
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