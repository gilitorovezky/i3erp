<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(read_projects) ".$current_time." info 2-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        
        $sql_st = "SELECT project_id,customer_id,project_number,company_name,project_m_contractor,project_manager,project_cstmr_lastname,project_name,project_details,
                   project_total_empl_cost,project_total_cntrc_cost,project_total_purchases,project_total_payments,project_type,project_address,file_uploaded,images_json FROM projects order by project_number ASC";  // Must be ASC to have the last project number at the last position

        $projects=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_projects) ".$current_time." info 3-insert sql_st:".$sql_st."\n", FILE_APPEND); 
        file_put_contents('../log/log_'.$logDate.'.log', "(read_projects) ".$current_time." info 4-# of rows:".$projects->num_rows."\n", FILE_APPEND); 

        // if any records found
        if ( $projects->num_rows > 0 ) {
            $i=0;
            //retrieve records
            while ($row = mysqli_fetch_assoc($projects)) { 
                
                $ret_recs[$i] =  array( "project_id"                =>  $row["project_id"],
                                        "project_number"            =>  $row["project_number"],
                                        "customer_id"               =>  $row["customer_id"],
                                        "company_name"              =>  $row["company_name"],
                                        "project_m_contractor"      =>  $row["project_m_contractor"],
                                        "project_cstmr_lastname"    =>  $row["project_cstmr_lastname"],
                                        "project_manager"           =>  $row["project_manager"],
                                        "project_type"              =>  $row["project_type"],
                                        "project_address"           =>  $row["project_address"],
                                        "project_name"              =>  $row["project_name"],
                                        "project_details"           =>  $row["project_details"],
                                        //"project_start_date"        =>  $row["project_start_date"],
                                        //"project_end_date"          =>  $row["project_end_date"],
                                        //"project_manager_id"        =>  $row["project_manager_id"],
                                        //"project_user_ids"          =>  $row["project_user_ids"],
                                        //"project_date_created"      =>  $row["project_date_created"], // no need to show the project date per Eyal
                                        "project_total_empl_cost"   =>  $row["project_total_empl_cost"],
                                        "project_total_cntrc_cost"  =>  $row["project_total_cntrc_cost"],
                                        "project_total_purchases"   =>  $row["project_total_purchases"],
                                        "project_total_payments"    =>  $row["project_total_payments"],
                                        "file_uploaded"             =>  $row["file_uploaded"],
                                        "images_json"               =>  $row["images_json"]);
                $i++;
            } 
        } 
        mysqli_close($con);   // Close DB connectin
    }
    else
        $ret_recs = array("Status"  => -1, // fail
                          "Notes"   => "General Error");
    echo json_encode($ret_recs); // return results
?>