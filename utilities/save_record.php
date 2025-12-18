<?php

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    require_once "../misc/db_connect.php";
    $logDate= date("n.j.Y");
    //require_once ('../misc/email.php')
    file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 0: inside save_record.php\n", FILE_APPEND); 
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 1-sql err:".mysqli_connect_errno()."\n", FILE_APPEND); 
    /*if(!isset($_POST["postSchedule"] )) { 
        file_put_contents('../log/log_'.$logDate.'.log', "(save_table) error : no pstSchedule set, exiting\n", FILE_APPEND); 
        exit;
    } */
    $totalLabor=0;
    if ( mysqli_connect_errno() == 0 ) { // no error from the DB
        
        if ($_POST["postData"] != '') {
            $post_body=$_POST["postData"];
            $table_headers=array ();
            $sqlArray=array();
            // all fields much match the db structure!!!!
            $table_headers["payments"]=array("payment_id","project_number","checknumber_cnf","payment_amount","payment_date","description"); // Remove customer name per Eyal 6/29
            $table_headers["invoices"]=array("invoice_id","project_number","vendor_name","invoice_number","invoice_amount","invoice_date","payment_method","invoice_desc");
            $table_headers["contractor_jobs"]=array("task_id","project_number","contractor_name","payment_amount","checknumber_cnf");
            $table_headers["projects"]=array("project_id","project_number","company_name","project_cstmr_lastname","project_type","project_m_contractor",
                                             "project_address","project_name",
                                             "project_details","project_total_empl_cost","project_total_cntrc_cost",
                                             "project_total_purchases"."project_total_payments");
            $table_headers["employee_jobs"]=array("task_id","project_number","employee_fname","job_date","job_signin","job_signout","total_hours","gas","file_uploaded");
            $table_headers["employees"]=array("employee_id","fullname","employment_type","hourlyrate","hourlyrate_effective_date","is_active");
            $table_headers["vendors"]=array("vendor_id","vendor_name","vendor_address","notes");
            //$table_headers["contractors"]=array("contractor_id","name","address1","address2","zipcode","city","state","notes"); 
            $table_headers["contractors"]=array("contractor_id","name","notes");
            $table_headers["hourlyrate_history"]=array("hr_id","hourlyrate","effective_date","employee_id");
            $table_headers["companies"]=array("company_id","company_name","notes");

            $sqlArray["payments"]="UPDATE projects prjct INNER JOIN (SELECT project_number, SUM(payment_amount) as total FROM payments GROUP BY project_number) pymnt ON prjct.project_name = pymnt.project_number
                                            SET prjct.project_total_payments = pymnt.total";
            $sqlArray["contractor jobs"]="UPDATE projects prjct INNER JOIN (SELECT project_number, SUM(payment_amount) as total FROM contractor_jobs GROUP BY project_number) cntr_jbs ON prjct.project_name = cntr_jbs.project_number
                                            SET prjct.project_total_cntrc_cost = cntr_jbs.total";
            $sqlArray["purchases"]="UPDATE projects prjct INNER JOIN (SELECT project_number, SUM(invoice_amount) as total FROM invoices GROUP BY project_number) invcs ON prjct.project_name = invcs.project_number
                                            SET prjct.project_total_purchases = invcs.total";

            $rowCount= count($post_body); 
            $moduleName=strtolower($post_body[0]["moduleName"]);
            $headers=$post_body[1]["headers"];
            $headersCount=count($post_body[1]["headers"]);
            
            $tableName=$post_body[2]["tableName"];
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2-module:".$moduleName." Table:".$tableName." rowCount:".$rowCount." headersCount:".$headersCount."\n", FILE_APPEND); 
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2.1:header-".print_r($headers,true)."\n", FILE_APPEND); 
            $sql_result=0;
            $row=3; // skip the first 2 entries: module and headers
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2.2:row(".$row."):".print_r($post_body[$row],true)."\n", FILE_APPEND); 
            $oldProjectName=0;
            $new_project_name=0;
            $project_id=$post_body[$row][0];
            // Special case only Projects - checking if the new name is same as the last name cause project names could be changed.
            // if yes, then retain the old name to update across all tables
            if ( $moduleName == "projects" ) {
                
                $sql_st= "SELECT project_name from projects where project_id = '$project_id'";
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.3-sql_st:".$sql_st."\n", FILE_APPEND);
                $result=mysqli_query($con,$sql_st);
                if ( $result->num_rows > 0 ) {
                    $ret_row = mysqli_fetch_row($result); // there is only one result
                    $oldProjectName = $ret_row[0];
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.4-found project_name:".$oldProjectName."\n", FILE_APPEND);
                } else 
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." fatal error 999-no project_name found\n", FILE_APPEND);
            }
            // start to construct the replace sql 
            $sql_st= "REPLACE INTO $tableName SET ";
            for ($cell=0; $cell<$headersCount; $cell++)  // Go over the headers to construct the sql
                $sql_st .=$table_headers[$tableName][$cell]."='".$post_body[$row][$cell]."',"; 
                //  $sql_st .=$post_body[1]["headers"][$cell]."='".$post_body[$row][$cell]."',";  // for future : use the column name dynamicly from the DB and not staticly from the table hard coded
            $sql_st = substr($sql_st, 0, -1); // Remove the last char ,
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND);
            if (mysqli_query($con,$sql_st)) {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)." modulename ".$moduleName."\n", FILE_APPEND);

                switch ( $moduleName ) {

                    case "payments"         :
                        
                    case "contractor jobs"  :
                    
                    case "purchases"        :
                        $project_name=$post_body[$row][1];
                        $sql_st=$sqlArray[$moduleName];
                        if (mysqli_query($con,$sql_st)) {
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 4.2-sql_st:".$sql_st." # of affct rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            // retrieve the most updated values to return to the app
                            $sql_st= "SELECT project_total_payments, project_total_cntrc_cost,project_total_purchases from projects where project_name = '$project_name'";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.3-sql_st:".$sql_st."\n", FILE_APPEND);
                            $result=mysqli_query($con,$sql_st);
                            if ( $result->num_rows > 0 ) {
                                $ret_row = mysqli_fetch_row($result); // there is only one result
                                $oldProjectName = $ret_row[0];
                                $ret_recs[1]=array( "totalPayment" => $ret_row[0],"totalCntrc_cost" =>  $ret_row[1], "totalPurchases" => $ret_row[2]);
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.4-totalPayment:".$ret_row[0]." totalCntrCost".$ret_row[1]." totalPurchases".$ret_row[2].".\n", FILE_APPEND);
                            }
                        }
                        else
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 1-failed to update:".$sql_st."\n", FILE_APPEND);
                        
                        
                        break;
                        
                    case "employee jobs"    :

                        $taskID=$post_body[$row][0];
                        $fullname=$post_body[$row][2]; // get the fullname from the record
                        $employee_id = $post_body[$row][9]; // only in employee_jobs, the employee_id is the last field in the record
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 5-full name:".$fullname." eID:".$employee_id." taskID:".$taskID."\n", FILE_APPEND);
                        // Continue only if eID found
                        if ($employee_id != -1) {
                            // update employeeID 
                            $sql_st="UPDATE employee_jobs ejobs INNER JOIN (SELECT fullname, employee_id FROM employees WHERE fullname = '$fullname') empl 
                                        ON ejobs.employee_fname = empl.fullname SET ejobs.employee_id=empl.employee_id";
                            $ret=mysqli_query($con,$sql_st);
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 6-sql_st:".$sql_st."\n", FILE_APPEND);
                            // Retreive the current labor cost
                            $project_name=$post_body[$row][1];
                            //$employee_id = $post_body[$row][9]; // get the eID from the record
                            $sql_st= "SELECT hrh.hourlyrate,hrh.effective_date FROM hourlyrate_history hrh 
                                        WHERE hrh.employee_id='$employee_id' order by hrh.effective_date DESC limit 1";
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 7-sql_st:".$sql_st." eID=".$employee_id."\n", FILE_APPEND);
                            $hours=$post_body[$row][6];
                            $ret=mysqli_query($con,$sql_st);
                            $rows_num=mysqli_num_rows($ret);

                            if ($rows_num) {  // Hourly rate found
                                $rows = $ret->fetch_all(MYSQLI_ASSOC);
                                $hourly_rate=$rows[0]["hourlyrate"];
                            }
                            else // HR not found - use default
                                $hourly_rate=1;
                            $totalLabor=round($hours*$hourly_rate,2);
                            
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 8-hourly rate:".$hourly_rate." total hours:".$hours." job labor(hr x # of hours):".$totalLabor."\n", FILE_APPEND);
                            if ( $hours > 8 ) {// is there over time
                                $overtime=round(($hours-8)*($hourly_rate*0.5),2);
                                $totalLabor+=$overtime;  // over time is 150% for every hour past the 8th hour                
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 9-overtime:".$overtime." New total labor:".$totalLabor."\n", FILE_APPEND);
                            }                              
                            // Update the labor of the project
                            $sql_st="UPDATE employee_jobs set labor_cost = '$totalLabor' where task_id = '$taskID'";
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 9.1-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            // Update the emply cost field with the sum of all empl prcosts
                            $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(labor_cost) as total FROM employee_jobs GROUP BY project_number) empl_jbs ON prjct.project_name = empl_jbs.project_number
                                       SET prjct.project_total_empl_cost = empl_jbs.total";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 10-sql_st:".$sql_st."\n", FILE_APPEND);
                            if ( mysqli_query($con,$sql_st) ) {
                                $sql_st="select project_total_empl_cost from projects where project_name ='$project_name'"; // retrieve the total labor to buble up back to the app
                                $result=mysqli_query($con,$sql_st);
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 11-sql_st:".$sql_st."\n", FILE_APPEND);
                                if ( $result->num_rows > 0 ) {
                                    $ret_row = mysqli_fetch_row($result); // there is only one result
                                    $ret_recs[0]["Status"] = 1;
                                    $ret_recs[1]["totalLabor"] = $ret_row[0];
                                }
                            }
                            else
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 3-failed to update labor_cost"."\n", FILE_APPEND);

                            //if ( mysqli_query($con,$sql_st) ) 
                            //    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 11-update project:".$project_name." total labor:".$totalLabor."\n", FILE_APPEND);
                        }
                        else
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 4-No eID found"."\n", FILE_APPEND);

                    break;

                    case "hourly rate"   :
                        
                        $eID = $post_body[$row][3];
                        $hourlyRate = $post_body[$row][1];
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 12-table2write:".$moduleName." eID:".$eID."\n", FILE_APPEND);
                        $sql_st= "UPDATE employees SET hourlyrate = '$hourlyRate' where employee_id = '$eID'";
                        if ( mysqli_query($con,$sql_st) ) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 13-sql_st:".$sql_st."\n", FILE_APPEND);
                        else
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 5-failed to update hourly rate"."\n", FILE_APPEND);

                    break;

                    case "employees"            :
                        
                        $today = date('Y-m-d');
                        $employeeID=$post_body[$row][0];
                        $empl_st="SELECT employee_id from accounts where employee_id='$employeeID'";
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 14-empl_st:".$empl_st."\n", FILE_APPEND);
                        $isEmplFound=mysqli_query($con,$empl_st);
                        if ($isEmplFound->num_rows == 0) { // not found in accounts - add
                            $fullname=$post_body[$row][1];
                            $username=strtolower($fullname);
                            $upassword ="1234";
                            $password = password_hash($upassword , PASSWORD_DEFAULT);
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 16-adding new user to accounts\n", FILE_APPEND);
                            $sql_st="INSERT INTO accounts (employee_id,fullname,username,password,is_active) VALUES ('$employeeID','$fullname','$username','$password','0')";
                            if ( mysqli_query($con,$sql_st) ) {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 17-sql_st:".$sql_st." # of inserted row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                $sql_st="INSERT INTO hourlyrate_history (employee_id,hourlyrate,effective_date) VALUES ('$employeeID','0','$today')"; // insert default HR
                                if ( mysqli_query($con,$sql_st) ) 
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 18-sql_st:".$sql_st." # of inserted row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                else
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 5-sql_error:".mysqli_connect_errno()."\n", FILE_APPEND);
                            }
                        }
                        else {
                            $empl_st="SELECT distinct employee_id from hourlyrate_history where employee_id='$employeeID'";
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 13-empl_st:".$empl_st."\n", FILE_APPEND);
                            $isEmplFound=mysqli_query($con,$empl_st);
                            if ($isEmplFound->num_rows == 0) {
                                // no employee found - add a new entry to hourlyrate_history,
                                $sql_st="INSERT INTO hourlyrate_history (employee_id,hourlyrate,effective_date) VALUES ('$employeeID','0','$today')";
                                if ( mysqli_query($con,$sql_st) ) 
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 14-sql_st:".$sql_st." # of inserted row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            }
                            else { // employee found so just update hrh_history

                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 5-sql_error:".mysqli_connect_errno()."\n", FILE_APPEND);
                            }
                        // check if the user already exist in accounts before adding
                        }

                    break;

                    case "projects" :
                        
                        $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(payment_amount) as total FROM payments GROUP BY project_number) pymnt ON prjct.project_name = pymnt.project_number
                                    SET prjct.project_total_payments = pymnt.total";
                        if (mysqli_query($con,$sql_st))
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 17-Update succesfully project total prj paymetns\n", FILE_APPEND);

                        $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(payment_amount) as total FROM contractor_jobs GROUP BY project_number) cntr_jbs ON prjct.project_name = cntr_jbs.project_number
                                    SET prjct.project_total_cntrc_cost = cntr_jbs.total";
                        if (mysqli_query($con,$sql_st))
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 18-Update succesfully project total prj cntrc_jobs\n", FILE_APPEND);

                        $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(invoice_amount) as total FROM invoices GROUP BY project_number) invcs ON prjct.project_name = invcs.project_number
                                    SET prjct.project_total_purchases = invcs.total";
                        if (mysqli_query($con,$sql_st))
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19-Update succesfully project total prj invocies\n", FILE_APPEND);

                        $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(labor_cost) as total FROM employee_jobs GROUP BY project_number) empl_jobs ON prjct.project_name = empl_jobs.project_number
                                    SET prjct.project_total_purchases = empl_jobs.total";
                        if (mysqli_query($con,$sql_st))
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19-Update succesfully project total prj empl jobs\n", FILE_APPEND);

                        $new_project_name=$post_body[$row][7];
                        $sql_st = "UPDATE employee_jobs SET project_number = '$new_project_name' where project_number = '$oldProjectName'";
                        if (mysqli_query($con,$sql_st)) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 20-Update employee_jobs project_name:".$oldProjectName." with:".$new_project_name."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);
 
                        $sql_st = "UPDATE contractor_jobs SET project_number = '$new_project_name' where project_number = '$oldProjectName'";
                        if (mysqli_query($con,$sql_st)) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 21-Update contractor_jobs project_name:".$oldProjectName." with:".$new_project_name."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);
    
                        $sql_st = "UPDATE invoices SET project_number = '$new_project_name' where project_number = '$oldProjectName'";
                        if (mysqli_query($con,$sql_st)) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 22-Update invoices project_name:".$oldProjectName." with:".$new_project_name."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);

                        $sql_st = "UPDATE payments SET project_number = '$new_project_name' where project_number = '$oldProjectName'";
                        if (mysqli_query($con,$sql_st)) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 23-Update payments project_name:".$oldProjectName." with:".$new_project_name."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);  
                    break;

                    default:
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning 20-module name.".$moduleName."\n", FILE_APPEND);
                    break;
                }
                $sql_result=1;
                /*file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 17-sql_st:".$sql_st."\n", FILE_APPEND);
                if (mysqli_query($con,$sql_st)) {
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 18-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    $sql_result=1;
                } 
                else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 2-no update done\n", FILE_APPEND);
                    $sql_result=0;
                }*/
            }
            else {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 5-sql_error:".mysqli_connect_errno()."\n", FILE_APPEND);
                $sql_result=0;
            }
        //end_sms($task_date,$task_escription);
        }
        else {
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 6-No passing parameters found"."\n", FILE_APPEND);
            $sql_result=0;
        }
        mysqli_close($con);   // Close DB connectin
        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 100:return result:".$sql_result."\n", FILE_APPEND);
        $ret_recs[0]["Status"] = $sql_result;
        
        echo json_encode($ret_recs);
    }
  ?>