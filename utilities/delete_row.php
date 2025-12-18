<?php
    require_once "../misc/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    
    $ret_recs = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 1-inside delete_row.php, sql err:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        if ($_POST["postData"] != '') {
            $post_body=$_POST["postData"];
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." ".print_r($post_body,true)."\n", FILE_APPEND);
            $moduleName=strtolower($post_body[0]["screenName"]);
            $tableName=strtolower($post_body[0]["tableName"]);
            $tableKey=$post_body[1]['key'];
            $Name=$post_body[3]["Name"];
            $ID=$post_body[4]["ID"];
            
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 2-Module:".$moduleName." ID:".$ID."\n", FILE_APPEND);
            
            $sqlArray["payments"]="UPDATE projects SET project_total_payments = project_total_payments - (SELECT payment_amount FROM payments where payment_id = '$ID') where projecT_name = '$Name'";
            $sqlArray["contractor jobs"]="UPDATE projects SET project_total_cntrc_cost = project_total_cntrc_cost - (SELECT payment_amount FROM contractor_jobs where task_id = '$ID') where projecT_name = '$Name'";
            $sqlArray["purchases"]="UPDATE projects SET project_total_purchases = project_total_purchases - (SELECT invoice_amount FROM invoices where invoice_id = '$ID') where projecT_name = '$Name'";
            $sqlArray["employee jobs"]="UPDATE projects SET project_total_empl_cost = project_total_empl_cost - (SELECT labor_cost FROM employee_jobs where task_id = '$ID') where projecT_name = '$Name'";
            $sqlArray["vendors"]="SELECT CURRENT_DATE";
            $sqlArray["contractors"]="SELECT CURRENT_DATE";
            $sqlArray["companies"]="SELECT CURRENT_DATE";
            $sql_st=$sqlArray[$moduleName];
            switch ($moduleName) {
              
                case "payments"         :
                case "contractor jobs"  :
                case "purchases"        :
                case "employee jobs"    :
                
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND);          
                    if ( mysqli_query($con,$sql_st) ) 
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    
                case "vendors"          :
                case "contractors"      :
                case "companies"        :         

                    $sql_st= "DELETE from $tableName WHERE $tableKey='$ID'";
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 5-delete the record:".$sql_st."\n", FILE_APPEND);  
                    if (mysqli_query($con,$sql_st)) 
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) info 6:".$current_time." # of affected rows-".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    else
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 1-failed yo update projects\n", FILE_APPEND);
                    mysqli_close($con);   // Close DB connectin
                    $ret_recs=array("Status" => "1");
                        
                default:
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." Warninig 1-No delete statement\n", FILE_APPEND);
                    $ret_recs=array("Status" => $ID);    // Set the return result to success
                    break;
            }
        }  
        else
            $ret_recs = array("Status"  => -1, // fail
                              "Notes"   => "General Error(-1)");
    }
    else
        $ret_recs = array("Status"  => -2, // fail
                          "Notes"   => "General Error(-2)");
    echo json_encode($ret_recs); // return results
  ?>