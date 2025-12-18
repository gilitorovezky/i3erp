<?php
    require_once "db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    
    $ret_recs = array("Status" => 1);   

    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 1-inside delete_row.php, sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        if ($_POST["postData"] != '') {
            $post_body=$_POST["postData"];
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." ".print_r($post_body,true)."\n", FILE_APPEND);
            $moduleName=strtolower($post_body[0]["screenName"]);
            $tableName=strtolower($post_body[0]["tableName"]);
            $tableKey=$post_body[1]['key'];
            //$Name=$post_body[3]["Name"];
            $Name = str_replace("'","\'", $post_body[3]["Name"]);   // escape the name just in case
            $ID=$post_body[4]["ID"];
               
            file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 2-Module:".$moduleName." ID:".$ID."\n", FILE_APPEND);
            
            $sqlArray["payments"]="UPDATE projects SET project_total_payments = project_total_payments - (SELECT payment_amount FROM payments where payment_id = '$ID') where project_name = '$Name'";
            $sqlArray["sub contractors"]="UPDATE projects SET project_total_cntrc_cost = project_total_cntrc_cost - (SELECT payment_amount FROM contractor_jobs where task_id = '$ID') where project_name = '$Name'";
            $sqlArray["purchases"]="UPDATE projects SET project_total_purchases = project_total_purchases - (SELECT CAST(invoice_amount AS UNSIGNED) FROM purchases where invoice_id = '$ID') where project_name = '$Name'";
            $sqlArray["employee jobs"]="UPDATE projects SET project_total_empl_cost = project_total_empl_cost - (SELECT labor_cost FROM employee_jobs where task_id = '$ID') where project_name = '$Name'";
            $sqlArray["vendors"]="SELECT CURRENT_DATE";
            $sqlArray["contractors"]="SELECT CURRENT_DATE";
            $sqlArray["companies"]="SELECT CURRENT_DATE";
            $sql_st=$sqlArray[$moduleName];
            switch ($moduleName) {
              
                case "payments"         :
                case "sub contractors"  :
                case "purchases"        :
                case "employee jobs"    :
                
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND);          
                    if ( mysqli_query($con,$sql_st) ) {
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                        // after updating the corresponding value, retrieve the employee cost.
                        $sql_st="select project_total_empl_cost from projects where project_name ='$Name'"; // retrieve the total labor to buble up back to the app
                        $result=mysqli_query($con,$sql_st);
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4.5-sql_st:".$sql_st."\n", FILE_APPEND);
                        if ( $result->num_rows > 0 ) {
                            $ret_row = mysqli_fetch_row($result); // there is only one result
                            $ret_recs=array("Status" => "1","totalLabor" => $ret_row[0]);
                        }
                    }
                    
                case "vendors"          :
                case "contractors"      :
                case "companies"        :         

                    $sql_st= "DELETE from $tableName WHERE $tableKey='$ID'";
                    file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." info 5-delete the record:".$sql_st."\n", FILE_APPEND);  
                    if (mysqli_query($con,$sql_st)) 
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time."info 6-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    else {
                        file_put_contents('../log/log_'.$logDate.'.log', "(delete_row) ".$current_time." error 1-failed yo update projects\n", FILE_APPEND);
                        $ret_recs=array("Status" => "-1");
                    }
                    closeConnection("delete_row");
                break;

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