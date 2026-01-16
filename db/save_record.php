<?php
    header('Content-Type: application/json; charset=utf-8');

    require_once "db_connect.php";
    require_once "../fileops/atomFS.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    $logDate= date("n.j.Y");
    define("VERSION", "11-07-2024");
    //require_once ('../misc/email.php')
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 0-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    /* if(!isset($_POST["postSchedule"] )) { 
        file_put_contents('../log/log_'.$logDate.'.log', "(save_table) error : no pstSchedule set, exiting\n", FILE_APPEND); 
        exit;
    } */
    $totalLabor=0;
    if ( !isset($_POST["postData"]) ) { 
        file_put_contents('../log/log_'.$logDate.'.log',"(save_schedule.php) ".$current_time." error 1:No postData set, exiting\n", FILE_APPEND);
        $ret_recs=array("Status"            => -1,
                        "new_vendor_name"   => "No input argument found");
    } else 
        if ( mysqli_connect_errno() == 0 ) { // no error from the DB
        
            $sqlArray=array();
            $sqlArray["payments"]="UPDATE projects prjct INNER JOIN (SELECT project_number, SUM(IF(payment_amount='', 0.0,CAST(payment_amount AS decimal(20,2)))) as total 
                FROM payments GROUP BY project_number) pymnt ON prjct.project_name = pymnt.project_number 
                SET prjct.project_total_payments = pymnt.total";

            $sqlArray["sub contractors"]="UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(payment_amount) as total 
                FROM contractor_jobs GROUP BY project_number) cntr_jbs ON prjct.project_name = cntr_jbs.project_number
                SET prjct.project_total_cntrc_cost = cntr_jbs.total";

            $sqlArray["purchases"]="UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(IF(purchase_amount='', 0.0,CAST(purchase_amount AS decimal(20,2)))) as total 
                FROM purchases GROUP BY project_number) prchs ON prjct.project_name = prchs.project_number
                SET prjct.project_total_purchases = prchs.total";

            $return_code=1;
            $post_body=($_POST["postData"]);
            $arrayJson=json_decode($_POST["record"]); 
            $rowCount = count($post_body); 
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 1-post_body:".print_r(($post_body),true). "row count:".$rowCount."\n", FILE_APPEND); 
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 1.1-record:".print_r(($arrayJson),true)."\n", FILE_APPEND); 
           
            $moduleName = strtolower($post_body["moduleName"]);
            $newFolderName=$post_body["newFolderName"];
            $rootDir=strtolower($post_body["rootDir"]);  // root dir of the projects
            $headers = $post_body["headers"];
            $headersCount = count($post_body["headers"]);
            $keyName=$post_body["keyName"];
            
            $tableName = $post_body["tableName"];
            //$arrayJson = json_decode($post_body[4]);    // tempRow2 in JS
            //$row_number=3; // skip the first 3 entries: module and headers

            file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2-module:".$moduleName." Table:".$tableName." rowCount:".$rowCount." headersCount:".$headersCount."\n", FILE_APPEND); 
            
            //file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2.3:row(".$row_number."):".print_r($arrayJson->record,true)."\n", FILE_APPEND); 

            $old_ProjectName = "";
            $new_project_name = "";
            //$project_id = $arrayJson->record->ID;
            //file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2.1:header-".print_r($headers,true)." keyName:".$keyName." value:".$arrayJson->record->$keyName."\n", FILE_APPEND); 
            //file_put_contents('../log/log_'.$logDate.'.log', "(save_record.php) ".$current_time." info 2.1:header-".print_r($headers,true)."\n", FILE_APPEND);

            $project_created_date="";
            // Special case only Projects - checking if the new name is same as the last name cause project names could be changed.
            
            if ( $moduleName == "projects" ) {  // if yes, then retain the old name to update across all tables
                //$new_project_name=$arrayJson->record->projectname;//$post_body[$row_number][8];
                $old_ProjectName = $arrayJson->record->projectname; // retain the old name to update across all tables
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.3.5-found project_name:".$old_ProjectName."\n", FILE_APPEND);

                if ( $arrayJson->record->isNewRecord != true ) {
                    
                    $project_id = $arrayJson->record->$keyName;
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.4-new project name:".$new_project_name." is not a new record\n", FILE_APPEND);
                    $sql_st = "SELECT project_name from projects where project_id = '$project_id'";
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.5-sql_st:".$sql_st."\n", FILE_APPEND);
                    $result=mysqli_query($con,$sql_st);
                //if ( $result->num_rows > 0 ) {  // project found so this is not a new project
                    $ret_row = mysqli_fetch_row($result); // there is only one result
                    $old_ProjectName = $ret_row[0];
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.4-found project_name:".$old_ProjectName."\n", FILE_APPEND);
                } else {    // a new record
                    $new_project_name = $old_ProjectName ;
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.5-new project name:".$new_project_name." a new record\n", FILE_APPEND);
                    $project_created_date=$arrayJson->record->createdtime;
                    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 2.6-new project createtime:".$project_created_date.", now create new prj folder and all sub folders\n", FILE_APPEND);
                    if ( $retCode=atomFS("mkdir","",$rootDir.$new_project_name,"","") ) {
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."purchases","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."payments","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."contractor jobs","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."employee jobs","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."misc","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."estimates","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."drawings","","");
                        atomFS("mkdir","",$rootDir.$new_project_name."/"."designes","","");
                    }
                    
                   //file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.7-no project_name found,project_created_date:".$project_created_date."\n", FILE_APPEND);
                }
            }

            // main replace statement to update the called table
            $sql_st = "REPLACE INTO $tableName SET ".$keyName."='".$arrayJson->record->$keyName."', "; // add the primary key as field zero
            //for ($cell=0; $cell<$headersCount; $cell++) { // Go over the headers to construct the sql
            foreach ($headers as $index => $header) {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 2.8-header index:".$index." header value:".$header."\n", FILE_APPEND);
                $new_value = str_replace("'","\'", $arrayJson->record->{'project_id'}); // escaping the field to support ' and "
                $sql_st .= $header."='".$new_value."',";
            }
            //}
          
            switch ($moduleName) {
                
                case "projects"            :
                    if ( $project_created_date != "" )// only for projects add project_created_Date at the end of the sql
                        $sql_st .= "project_created_date='".$project_created_date."'";
                    $sql_st .= ", project_name = '$old_ProjectName'";   
                break;

                case "scheduler"            :
                    $project_name = $arrayJson->record->prjName; 
                    $position = strpos($project_name, "-");
                    $prjNumber = substr($project_name, 0,$position); //extract the project number from the project name
                    $prjName = str_replace("'","\'", $arrayJson->record->prjName); // escaping the project name to support ' and "          
                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 3.1-Scheduler-prjNumer:".$prjNumber."\n", FILE_APPEND);
                    $sql_st .= "project_number ='".$prjNumber."', employee_id='".$arrayJson->record->employeeID."', is_assigned='".$arrayJson->record->is_assigned."'";
                break;

                case "employees"            :
                    
                    $sql_st .= "profile_color ='".$arrayJson->record->profile_color."'";
                    break;

                default:
                    $sql_st .= "foldername='".$arrayJson->record->{'Folder Name'}."'"; // add the folder name at the end
                    //$sql_st = substr($sql_st, 0, -1);   // remove the last char ","
            }
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 3.2-sql_st:".$sql_st."\n", FILE_APPEND);
            if (mysqli_query($con,$sql_st)) {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);

                switch ( $moduleName ) {

                    case "payments"                 :
                    case "sub contractors"          :
                    case "purchases"                :

                        $subFolderName=$post_body["subFolderName"];
                        $project_name = str_replace("'","\'", $arrayJson->record->{'Project Number'}); //  $post_body[$row_number][1]); // escaping the project name to support ' and "
                        $sql_st=$sqlArray[$moduleName];
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 4.1-sql_st:".$sql_st."\n", FILE_APPEND);
                        if ( $project_name != "" ) {
                            if (mysqli_query($con,$sql_st)) {
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 4.2-sql_st:".$sql_st." # of affct rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                // retrieve the most updated values to return to the app
                                $sql_st= "SELECT project_total_payments, project_total_cntrc_cost,project_total_purchases from projects where project_name = '$project_name'";
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4.3-sql_st:".$sql_st."\n", FILE_APPEND);
                                $result=mysqli_query($con,$sql_st);
                                if ( $result->num_rows > 0 ) {
                                    $ret_row = mysqli_fetch_row($result); // there is only one result
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4.4-totalPayment:".$ret_row[0]." totalCntrCost:".$ret_row[1]." totalPurchases:".$ret_row[2].".\n", FILE_APPEND);
                                    $ret_recs=array("Status" => 1,
                                                    "totalPayment"      => $ret_row[0],
                                                    "totalCntrc_cost"   => $ret_row[1], 
                                                    "totalPurchases"    => $ret_row[2]);
                                }
                                else {
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 4.5-no records found for ".$project_name." ".mysqli_affected_rows($con).".\n", FILE_APPEND);
                                    $ret_recs=array("Status" => -1);
                                    $return_code = -1;
                                }
                            }
                            else {
                                    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 1-failed to update:".$sql_st."\n", FILE_APPEND);
                                    $ret_recs=array("Status" => -2);
                                    $return_code = -2;
                            }
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 4.5-subFoldername".$subFolderName." newFolderName:".$newFolderName."\n", FILE_APPEND);
                            if ( $subFolderName != $newFolderName && // is it same record but different record fields
                                $newFolderName != "" ) {
                                $retCode=atomFS("rendir",$rootDir.$project_name."/".$moduleName."/".$subFolderName,"","",$rootDir.$project_name."/".$moduleName."/".$newFolderName); // rename from sub to new 
                            }
                            else // no need to rename just create a new folder
                                $retCode=atomFS("mkdir","",$rootDir.$project_name."/".$moduleName."/".$subFolderName,"","");
                        }
                        else {
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 1-prjct_name is empty\n", FILE_APPEND);
                                $ret_recs=array("Status" => -3);
                                $return_code = -3;
                        }

                    break;
                        
                    case "employee jobs"            :
                        $subFolderName=$post_body["subFolderName"];
                        $project_name = str_replace("'","\'", $arrayJson->record->{'Project Number'}); //  $post_body[$row_number][1]); // escaping the project name to support ' and "

                        $employee_id = $arrayJson->record->employeeID; //$post_body[$row_number][12]; // only in employee_jobs, the employee_id is the last field in the record
                        $taskID = $arrayJson->record->$keyName; //$post_body[$row_number][0];
                        $projectNumber=$arrayJson->record->{'Project Number'}; //$post_body[$row_number][1];
                        $project_id = $arrayJson->record->projectID; //$post_body[$row_number][14];
                        $fullname = $arrayJson->record->{'Full Name'};//$post_body[$row_number][2]; // get the fullname from the record
                        $task_time = $arrayJson->record->{'Job Date'}; //$post_body[$row_number][3] ; //." ".$post_body[$row_number][4].":00"; // get the task time
                        $totalLaborTime = $arrayJson->record->{'Total Hours'}; //$post_body[$row_number][7];
                        $notes = $arrayJson->record->Description; //$post_body[$row_number][9];
                        $hourly_rate = $arrayJson->record->hourlyrate; //$post_body[$row_number][13];
                        //file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info .6-creating new subflder:", FILE_APPEND);
                        if ( $projectNumber != "") { // create new dir 
                            if ( $subFolderName != $newFolderName && // is it same record but different record fields
                                    $newFolderName != "" ) 
                                    $retCode=atomFS("rendir",$rootDir.$project_name."/".$moduleName."/".$subFolderName,"","",$rootDir.$project_name."/".$moduleName."/".$newFolderName); // rename from sub to new 
                                
                                else // no need to rename just create a new folder
                                    $retCode=atomFS("mkdir","",$rootDir.$project_name."/".$moduleName."/".$subFolderName,"","");
                        }
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 5-full name:".$fullname." eID:".$employee_id." taskID:".$taskID." laborTime:".$totalLaborTime." hr-rate:".$hourly_rate."\n", FILE_APPEND);
                        $project_name = str_replace("'","\'",$projectNumber); // escaping the field to support ' 
                        $sql_st="SELECT task_status from task_list where task_id = '$taskID'"; // get the task status, if task is in signin or closed than the submison is u other wise, m
                        if ( $result=mysqli_query($con,$sql_st) ) {
                            if ( $result->num_rows > 0 ) {  // task exist - update the table
                                $prjNumber=explode('-',$project_name,0); // extract the project number from the project name
                                $sql_st = "UPDATE task_list set project_name = '$project_name', employee_name = '$fullname', employee_id = '$employee_id', task_date = '$task_time', task_description = '$notes' where task_id = '$taskID'";
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 5.1-updating task_list sql_st:".$sql_st."\n", FILE_APPEND);
                            }
                            else { // task not exist - add new one using replace
                                $prjNumber=explode('-',$project_name); // extract the project number from the project name
                                $prjNumber = $prjNumber[0];
                                $sql_st="REPLACE INTO task_list SET task_id='$taskID',task_status='open',project_number='$prjNumber',project_name='$project_name',task_description='$notes',employee_id='$employee_id',employee_name='$fullname',task_date='$task_time',seq_number='1'";
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 5.2-adding a new task to task_list sql_st:".$sql_st."\n", FILE_APPEND);
                            }
                        
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 5.3-update task_list succesfully\n", FILE_APPEND);
                            else
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." warning 5.3-failed to update task_list with new project_number, sql_st:".$sql_st." sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                        }
                        $sql_st = "UPDATE employee_jobs ejobs SET ejobs.submission_type = 'm',  ejobs.employee_id = $employee_id where task_id='$taskID'";  
                        // $sql_st = "UPDATE employee_jobs ejobs INNER JOIN (SELECT fullname, employee_id FROM employees WHERE fullname = '$fullname') empl 
                        //            ON ejobs.employee_fname = empl.fullname SET ejobs.submission_type = 'm',  ejobs.employee_id=empl.employee_id";
                        $ret=mysqli_query($con,$sql_st);
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 6-sql_st:".$sql_st."\n", FILE_APPEND);
                        if ( $employee_id > -1) {
                            if ( $totalLaborTime > 0 ) {   // only continue if $totalLaborTime > 0

                                $sql_st="UPDATE task_list SET task_status='closed' where task_id='$taskID'";    // mark the job as closed
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 7-sql_st:".$sql_st."\n", FILE_APPEND);
                                if ( mysqli_query($con,$sql_st) ) 
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 8-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                else
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning 8-sql_error:".mysqli_error($con)."\n", FILE_APPEND);

                                $pieces  = explode(".", $totalLaborTime);   // split the hours and minutes
                                $workingHours   = $pieces[0];
                                $workingMinutes = $pieces[1];
                                if ( ( $post_body[$row_number][5] != "" &&  // lunch in and lunch out are not empty
                                        $post_body[$row_number][6]!= "" ) ) {
                                    $lunchIn = new DateTime($post_body[$row_number][5]);
                                    $lunchOut = new DateTime($post_body[$row_number][6]);
                                    $interval     = $lunchIn->diff($lunchOut);
                                    $lunchHours   = $interval->h;
                                    $lunchMinutes = ($lunchHours*60)+$interval->i;
                                    $totalWorkingMinutes = ($workingHours*60) + $workingMinutes - ($lunchHours*60)-$interval->i;
                                    $workingHours = intdiv($totalWorkingMinutes, 60);
                                    $totalWorkingMinutes = $totalWorkingMinutes % 60;
                                    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 8-workng hours:".$workingHours." working minutes:".$totalWorkingMinutes." lunch hours:".$interval->h." lunchMinutes:".$interval->i."\n", FILE_APPEND);
                                }
                                
                                $overTimeHoursLabor=0;
                                if ( $workingHours > 8 ) {                // is there over time
                                    $standardHourLabor=round(8*$hourly_rate,2); // calculate standard labor, then calculate overtime with new rate (150%)
                                    $hourly_rate = $hourly_rate*1.5;      // overtime is 150%
                                    $overTimeHoursLabor=round(($workingHours-8)*$hourly_rate,2);
                                    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 8.1-overtime hourly rate:".$hourly_rate." overtime labor hours:$".$overTimeHoursLabor." standard labor(first 8h):$".$standardHourLabor."\n", FILE_APPEND);
                                }
                                else {
                                    $standardHourLabor=round($workingHours*$hourly_rate,2);
                                    file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 8.2-hourly rate:".$hourly_rate." labor:".$standardHourLabor."\n", FILE_APPEND);
                                }

                                $minutesLabor=round(($workingMinutes*$hourly_rate/60),2);                               
                                $totalLabor=$standardHourLabor+$overTimeHoursLabor+$minutesLabor;  // over time is 150% for every hour past the 8th hour
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 9-hourly rate:".$hourly_rate." hours:".$workingHours." minutes:".$workingMinutes." total job labor:".$totalLabor." overTimeHoursLabor:".$overTimeHoursLabor."\n", FILE_APPEND);
                                $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(labor_cost) as total FROM employee_jobs GROUP BY project_number) empl_jbs ON prjct.project_name = empl_jbs.project_number
                                            SET prjct.project_total_empl_cost = empl_jbs.total";
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 11-sql_st:".$sql_st."\n", FILE_APPEND);
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 12:-project number:".$projectNumber."\n", FILE_APPEND);
                                
                                if ( $sql_ret=mysqli_query($con,$sql_st) && ( $projectNumber != "" ) ) {
                                    $project_name = str_replace("'","\'",$projectNumber); // escaping the field to support ' and "
                                    $sql_st="SELECT project_total_empl_cost from projects where project_name ='$project_name'"; // retrieve the total labor to buble up back to the app
                                    $result=mysqli_query($con,$sql_st);
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 13-sql_st:".$sql_st."\n", FILE_APPEND);
                                    if ( $result->num_rows > 0 ) {
                                        $ret_row = mysqli_fetch_row($result); // there is only one result
                                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 13.5-new total amnt:".$ret_row[0]."\n", FILE_APPEND);
                                        $ret_recs=array("Status"        => 1,
                                                        "totalLabor"    => $ret_row[0]);  
                                    }
                                } else {
                                    if ($sql_ret == false )
                                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 3-failed to update labor_cost(sql err:".mysqli_error($con).")\n", FILE_APPEND);
                                    if ($projectNumber== "")   // empty project mnber
                                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 3.2-empty project number"."\n", FILE_APPEND);
                                    $ret_recs=array("Status" => -3);
                                    $return_code = -3;
                                }
                            } else {
                                file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 14-job hours less or equal 0: do nothing\n", FILE_APPEND);
                                $ret_recs=array("Status" => 1);
                            } 
                        }  else {
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 4-No eID found"."\n", FILE_APPEND);
                            $ret_recs=array("Status" => -4);
                        }
                    break;

                    case "hourly rate"          :
                        
                        $eID = $post_body[$row_number][3];
                        $hourlyRate = $post_body[$row_number][1];
                        $hourlyRateDate = $post_body[$row_number][2];
                        
                        $sql_st= "UPDATE employees SET hourlyrate = '$hourlyRate', hourlyrate_effective_date = '$hourlyRateDate' where employee_id = '$eID'"; // update the employee hr 
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 15-sql_st:".$sql_st."\n", FILE_APPEND);
                        if ( mysqli_query($con,$sql_st) ) 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 16-Update succesfully\n", FILE_APPEND);
                        else {
                            file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." error 5-failed to update hourly rate"."\n", FILE_APPEND);
                            $return_code = -5;
                        }
                        $ret_recs=array("Status" => $return_code);
                    break;

                    case "employees"            :
                        
                        $today = date('Y-m-d');
                        $employeeID=$arrayJson->record->ID;// $post_body[$row_number][0];
                        $rateType=$arrayJson->record->hourlyRateType; //$post_body[$row_number][9];   // newRate or currentRate
                        $hourlyRate=$arrayJson->record->{'Hourly Rate'};
                        $empl_st="SELECT employee_id from accounts where employee_id='$employeeID'";
                        file_put_contents('../log/log_'.$logDate.'.log',"(save_record) ".$current_time." info 16-rateType:".$rateType." empl_st:".$empl_st." hourlyRate:".$hourlyRate."\n", FILE_APPEND);
                        $isEmplFound=mysqli_query($con,$empl_st);
                        $hashPassword = password_hash($arrayJson->record->password , PASSWORD_DEFAULT);
                        if ( $arrayJson->record->is_newEmployee == "1") { // new Employee?
                            $fullname=str_replace("'","\'", $arrayJson->record->fullname); // esscaping the field to support ' and "
                            $username=strtolower($fullname);
                            if ( $fullname != "" )    {
                                $sql_st="INSERT INTO accounts (employee_id,fullname,username,password,is_active) VALUES ('$employeeID','$fullname','$username','$hashPassword','0')";
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 17-new user:".$sql_st."\n", FILE_APPEND);
                                if ( mysqli_query($con,$sql_st) ) {
                                //file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 18-sql_st:".$sql_st." # of inserted row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                    $sql_st="INSERT INTO hourlyrate_history (employee_id,hourlyrate,effective_date) VALUES ('$employeeID','$hourlyRate','$today')"; // insert default HR
                                    if ( mysqli_query($con,$sql_st) ) 
                                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19-sql_st:".$sql_st." # of inserted row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                                    else {
                                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 6-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                        $return_code = -6;
                                    }
                                }
                                else
                                    file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 6.5-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                            }
                            else
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 6.6:empty username - ignore update accounts and employees\n", FILE_APPEND);
                        }
                        else {                                     
                            $sql_st="UPDATE accounts set password='$hashPassword' where employee_id='$employeeID'";// update the password
                            if ($ret=mysqli_query($con,$sql_st))
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19.1-sql_st:".$sql_st." # updated row:".mysqli_affected_rows($con)."\n", FILE_APPEND);                      
                        }
                        if ( $rateType == "newRate" ) { //newRate- update the hourlyrate_history record
                            $sql_st="UPDATE hourlyrate_history set hourlyrate = '$hourlyRate' where employee_id='$employeeID'"; // there will be single record in hr_history since after adding the employee the record is read only
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19.2-sql_st:".$sql_st."\n", FILE_APPEND);
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 19.3-update hr_history, # updated row:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 7-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -7;
                            }
                        }
                        $ret_recs=array("Status" => $return_code);
                    break;

                    case "projects"                 :
                        
                        if ( $project_created_date == "" ) {  // if this is not a new project (project_created_date is empty) then need to update any field 
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 21-Not a new project - update all sums\n", FILE_APPEND);
                            $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(payment_amount) as total FROM payments GROUP BY project_number) pymnt ON prjct.project_name = pymnt.project_number
                                       SET prjct.project_total_payments = pymnt.total";
                            if (mysqli_query($con,$sql_st))
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 22-Update succesfully project total payments\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 8-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -8;
                            }

                            $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(payment_amount) as total FROM contractor_jobs GROUP BY project_number) cntr_jbs ON prjct.project_name = cntr_jbs.project_number
                                        SET prjct.project_total_cntrc_cost = cntr_jbs.total";
                            if (mysqli_query($con,$sql_st))
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 23-Update succesfully project total cntrc_jobs\n", FILE_APPEND);
                            else { 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 9-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -9;
                            }

                            $sql_st = "UPDATE projects prjct INNER JOIN (SELECT project_number,SUM(IF(purchase_amount='', 0.0,CAST(purchase_amount AS decimal(20,2)))) as total FROM purchases GROUP BY project_number) invcs ON prjct.project_name = invcs.project_number
                                        SET prjct.project_total_purchases = invcs.total";
                            if (mysqli_query($con,$sql_st))
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 24-Update succesfully project total invocies\n", FILE_APPEND);
                            else { 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 10-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -10;
                            }
                        } 
                        if ( ( $old_ProjectName != "" ) && ( $new_project_name != $old_ProjectName ) ) { // update the project name in case the old one was changed and the oldname is not empty
                            $old_ProjectName  = str_replace("'","\'", $old_ProjectName);  // esscaping the field to support ' and "
                            $new_ProjectName  = str_replace("'","\'", $new_project_name); // esscaping the field to support ' and "

                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 26-project name changed..updating-".$old_ProjectName." with-".$new_value."\n", FILE_APPEND);
                            $sql_st = "UPDATE employee_jobs SET project_number = '$new_ProjectName' where project_number = '$old_ProjectName'";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 27.1-sql_st:".$sql_st."\n", FILE_APPEND);
                            if (mysqli_query($con,$sql_st)) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 27.2-Update employee_jobs project_name:".$old_ProjectName." with:".$new_ProjectName."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 11-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -11;
                            }

                            $sql_st = "UPDATE contractor_jobs SET project_number = '$new_ProjectName' where project_number = '$old_ProjectName'";
                            if (mysqli_query($con,$sql_st)) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 28-Update contractor_jobs project_name:".$old_ProjectName." with:".$new_ProjectName."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -12;
                            }
        
                            $sql_st = "UPDATE purchases SET project_number = '$new_ProjectName' where project_number = '$old_ProjectName'";
                            if (mysqli_query($con,$sql_st)) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 29-Update purchases project_name:".$old_ProjectName." with:".$new_ProjectName."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -13;
                            }

                            $sql_st = "UPDATE payments SET project_number = '$new_ProjectName' where project_number = '$old_ProjectName'";
                            if (mysqli_query($con,$sql_st)) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 30-Update payments project_name:".$old_ProjectName." with:".$new_ProjectName."(afct_rows:".mysqli_affected_rows($con).")\n", FILE_APPEND);  
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -14;
                            }
                        }
                        else {
                            if ( $old_ProjectName == "" ) {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12.5-old project number is empty\n", FILE_APPEND);
                                $return_code = -15;
                            }
                        }
                        $ret_recs=array("Status" => $return_code);
                    break;

                    case "companies"                :
                        $new_company_name=$post_body[$row_number][1];
                        $orig_company_name=$post_body[$row_number][4];
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 31-Update company_name:".$orig_company_name." with:".$new_company_name.")\n", FILE_APPEND);  
                        if ( $orig_company_name != "" )  {   // only replace if new company name is not empty
                            $sql_st="UPDATE projects SET company_name = REPLACE(company_name,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 32-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 33-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);  
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 11-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -11;
                            }
                            $sql_st="UPDATE projects SET project_name = REPLACE(project_name,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 34-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 35-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);  
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -12;
                            }
                            $sql_st="UPDATE employee_jobs SET project_number = REPLACE(project_number,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 36-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 37-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 11-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -13;
                            }
                            $sql_st="UPDATE contractor_jobs SET project_number = REPLACE(project_number,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 38-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 39-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                            }
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 12-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -14;
                            }
                            $sql_st="UPDATE purchases SET project_number = REPLACE(project_number,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 40-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 41-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                            }
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 13-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -15;
                            }
                            $sql_st="UPDATE payments SET project_number = REPLACE(project_number,'$orig_company_name','$new_company_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 42-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) )
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 43-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 14-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -16;
                            }
                        }
                        else
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning- No new company name \n", FILE_APPEND);

                        $ret_recs=array("Status"            => $return_code,
                                        "new_company_name"  => $new_company_name);
                    break;

                    case "vendors"                  :
                        $new_vendor_name=$post_body[$row_number][1];
                        $orig_vendor_name=$post_body[$row_number][5];
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 44-Update vendor_name:".$orig_vendor_name." with:".$new_vendor_name.")\n", FILE_APPEND);  
                        if ( $orig_vendor_name != "" )  {   // only replace if new company name is not empty
                            $sql_st="UPDATE purchases SET vendor_name = REPLACE(vendor_name,'$orig_vendor_name','$new_vendor_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 45-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 46-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 15-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -17;
                            }
                        } else
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning- No new vendor name \n", FILE_APPEND);
                        $ret_recs=array("Status"            => $return_code,
                                        "new_vendor_name"   => $new_vendor_name);
                    break;

                    case "contractors"              :
                        $new_contractor_name=$post_body[$row_number][1];
                        $orig_contractor_name=$post_body[$row_number][4];
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 47-Update contractor_name:".$orig_contractor_name." with:".$new_contractor_name."\n", FILE_APPEND);  
                        if ( $orig_contractor_name != "" )  {   // only replace if new company name is not empty
                            $sql_st="UPDATE contractor_jobs SET contractor_name = REPLACE(contractor_name,'$orig_contractor_name','$new_contractor_name')";
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 48-sql_st:".$sql_st."\n", FILE_APPEND);  
                            if ( mysqli_query($con,$sql_st) ) 
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 49-afct_rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                            else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 16-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                                $return_code = -13;
                            }
                        }
                        else
                            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning- No new contractor name \n", FILE_APPEND);
                        $ret_recs=array("Status"                => $return_code,
                                        "new_contractor_name"   => $new_contractor_name);
                    break;
                    
                    //case "scheduler"                :
                    //    $createTime = date('Y-m-d H:i:s'); 
                    //    $sql_st="REPLACE INTO task_list SET task_status='open',project_number='$prjNumber',project_name='$prjName',task_description='$prjDesrc', create_time='$createTime',employee_id='$eID',employee_name='$eName',task_date='$task_date',seq_number='$seq_number'";
                    //    break;


                    default                         :
                        file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." warning 20-module name.".$moduleName."\n", FILE_APPEND);
                        $ret_recs=array("Status" => 1);
                    break;
                }
            }
            else {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 15-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                $ret_recs=array("Status" => -8);
            }
            //end_sms($task_date,$task_escription);
            closeConnection("save_record");
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." info 50:return result:".$ret_recs["Status"]."\n", FILE_APPEND);   
    } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(save_record) ".$current_time." error 16-sql error:".mysqli_connect_errno()."\n", FILE_APPEND);
            $ret_recs = array("Status" => -2,
                              "Notes"  => "sql error:".mysqli_connect_errno());   // return false (error)
    }
    echo json_encode($ret_recs);

  ?>