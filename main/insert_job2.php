<?php

     date_default_timezone_set("America/Los_Angeles");
     $local_current_time=date("H.i.m.d.Y");
     $logDate=date("n.j.Y");
     require_once "../db/db_connect.php";
     
     $calltype=$_POST['calltype']; // call type : gasUpload/generalUpload/generalUpload2/signoutUpload
     $ret_status = array();
     $images=array();
     $images['NumOfFiles']=0;
     $now = new DateTime();
     $t_signin=$now->format('H:i');            // sign in time 
     $t_signout=$now->format('H:i');              // sign out time
     $max_signin=0;
     $signin_found=0;         // flag to use when signin was found
     $today = date('Y-m-d');
     file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 2 ".print_r(($_POST),true)."\n", FILE_APPEND); 
     $employee_id=$_POST['employee_id'];
     if (isset($calltype)) {

          $file2upload="";

          switch ($calltype)  { 

               case "gasUpload"              :
               case "userUpload"             :
               case "generalUpload2"         :         // library 
               case "generalUpload3"         :         // configuration     
               case "generalUpload4"         :         // customers
                    //$tempJson = json_decode($_POST['tempJson'],true);
                    //file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 100-files".print_r(($tempJson),true)."\n", FILE_APPEND);
 
                    $target_dir = $_POST['target_dir']; 
                    $file2upload = $_FILES['fileToUpload'];
                    file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 3-eID:".$employee_id." callType:".$calltype." target_dir:".$target_dir."\n", FILE_APPEND);
                    file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 4-files:".print_r(($file2upload),true)."\n", FILE_APPEND);
 
                    if (!file_exists($target_dir)) {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 6-target dir does not exist-create new:".$target_dir."\n", FILE_APPEND); 
                         if ( !mkdir($target_dir,0700) ) {   
                              $target_dir=sys_get_temp_dir();
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 7-failed to create directory, use system tmp directory:".$target_dir."\n", FILE_APPEND); 
                         }
                         else
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 4.1-create directory succeeded\n", FILE_APPEND); 
                    }
                    $countfiles = count($_FILES['fileToUpload']['tmp_name']); // Get the number of files to upload
                    
                    file_put_contents('../log/log_'.$logDate.'.log',"(insert_job2) ".$current_time." info 5-Num of files to upload:".$countfiles."\n", FILE_APPEND); 
                    $fileuploadcounter=0;
                    $index_id=$_POST['index_id'];
                    for ( $i=0; $i < $countfiles; $i++ ) { // loop throu the files
                         $file = $index_id."-".$employee_id."-".$local_current_time."-".$file2upload['name'][$i];   // add prefix to the filename
                         $ret_code=UploadFile($file2upload['tmp_name'][$i],$target_dir.'/'.$file); // upload the file(s) to the target directory
                         $images['Files']['file2upload'.$i]=$file;
                         if ($ret_code) { // ret_code = 1 : file loaded successfully 
                              file_put_contents('../log/log_'.$logDate.'.log',"(insert_job2) ".$current_time." info 6-succesfully uploaad file number:".$i." fname:".$file."\n", FILE_APPEND); 
                              //if ( ( $calltype == "generalUpload2" )  ||
                              //     ( $calltype == "generalUpload4")) { // only when he file is uploaded form the screen or custoemrs add the file property to the json array
                                   
                              //     $images['Files']['file2upload'.$i]=$file;
                              $images['Files']['UploadedTime'.$fileuploadcounter]=$local_current_time;                           
                              $fileuploadcounter++;
                         }
                         else { // something went wrong with the DB
                              file_put_contents('../log/log_'.$logDate.'.log',"(insert_job2) ".$current_time." error 8-failed to upload file,error:".$ret_code."\n", FILE_APPEND); 
                               $images['Files']['UploadedTime'.$i]=$ret_code;
                         }
                    }
                    $images['NumOfFiles'] = $fileuploadcounter;
                    $ret_status[0]["Status"] = $fileuploadcounter;
                    
                    file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.1-callType:".$calltype." files:".print_r($images,true)."\n", FILE_APPEND); 
                    if ( $fileuploadcounter > 0  && 
                         (($calltype == "generalUpload2") ||
                          ($calltype == "generalUpload4")) )  {
                         $module=$_POST['module']; // call type : gasUpload/generalUpload/generalUpload2/signoutUpload 
                         $index=$_POST['index'];    // index of the table
                         //$index_id=$_POST['index_id'];    // index_id of the table
                         //$isFileExist=$_POST['isFileExist'];
                              
                         //file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.1-callType:".$calltype." ".print_r($images,true)."\n", FILE_APPEND); 
                        
                         //$json_images=json_encode($images);
                         //if ( $isFileExist == 0 )     // no file uploaded yet than just update
                         //     file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.2-first time file\n", FILE_APPEND); 
                         //else
                         //     file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.3- Adding to existing files\n", FILE_APPEND); 

                         $sql_st = "SELECT images_json, file_uploaded from $module where $index='$index_id'"; // read the current stored images
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 7.2-sql st:".$sql_st."\n", FILE_APPEND); 

                         $saved_files = mysqli_query($con,$sql_st);   // read the files from the db in preperatos to add the new files
                         $row = mysqli_fetch_assoc($saved_files);
                         if ( $row["file_uploaded"] > 0) {  // if any saved files in the db
                              $saveFiles = json_decode($row["images_json"],true);
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 7.3-sveFilesinDB array:".$row["file_uploaded"]." ".print_r($saveFiles,true)."\n", FILE_APPEND); 
                              for ($i=0; $i < $row["file_uploaded"] ; $i++) {   // adding the saved files into the list of files to return
                                   $images['Files']['UploadedTime'.($i+$fileuploadcounter)]= $saveFiles["Files"]['UploadedTime'.$i];   
                                   $images['Files']['file2upload'.($i+$fileuploadcounter)]= $saveFiles["Files"]['file2upload'.$i];
                                   //{"NumOfFiles":1,"Files":{"file2upload0":"1532-1-15.00.05.14.2025-051325_CCL_download.pdf","UploadedTime0":"15.00.05.14.2025"}}
                              }
                              $images['NumOfFiles'] += $row["file_uploaded"];   // add the number of saved files  to the total count
                         }
                         else
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 7.3-No files found\n", FILE_APPEND); 
                        
                         $ret_status['Files']=$images['Files'];
                         $ret_status['NumOfFiles']= $images['NumOfFiles']; 
                         $json_images=json_encode($images);      // encode the files into a temo var bnefore saving to the db
                         $newNumOfFiles=$images['NumOfFiles'];   // temp var to use on the sql statement to update the record in the db
                         $sql_st="UPDATE $module SET images_json='$json_images', file_uploaded = '$newNumOfFiles' where $index='$index_id'";
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 7.4-sql st:".$sql_st."\n", FILE_APPEND); 
                         if ( mysqli_query($con,$sql_st) ) 
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 7.5-"."update succesfully table ".$module." # of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                         else
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 8.5-update files failed:".mysqli_error($con)."\n", FILE_APPEND);                         
                         //}
                         //else {
                         //     file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.4-Adding new file to existing files\n", FILE_APPEND); 

                         //}
                    } else
                         file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 7.9-No json update,calltype:".$calltype."\n", FILE_APPEND); 

                    break;

               case "userJobUpload"          :
                    $target_dir=$_POST['target_dir']; 
                    $task_id=$_POST['task_id'];          // get task id
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2.php) ".$current_time." info 8-eID:".$employee_id." calltype:".$calltype." tID:".$task_id."\n",FILE_APPEND);

                    $sql_st= "SELECT project_number,job_signin FROM employee_jobs
                              WHERE employee_id='$employee_id' and task_id='$task_id'";
                              /* WHERE employee_id='$employee_id' and job_closed='N' and job_date like '$today%' order by job_date DESC limit 1";*/
          
                    $tasks=mysqli_query($con,$sql_st);
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 9-task_id=".$task_id." sql_st:".$sql_st." ,Num of recs found:". $tasks->num_rows."\n", FILE_APPEND); 
                    if ( $tasks->num_rows > 0 ) {
                         $row = mysqli_fetch_assoc($tasks);      // retrieve the record
                         $project_number=$row["project_number"]; // project nubmer is in 1st place
                         $target_dir.=$project_number;  // according to Eyal, the project related files are saved under project folder
                         $max_signin=$row["job_signin"];
                         $signin_found=1;
                         if (!file_exists($target_dir)) {
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 6-target dir does not exist-create new:".$target_dir."\n", FILE_APPEND); 
                              if ( !mkdir($target_dir,0700) ) {   
                                   $target_dir=sys_get_temp_dir();
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 7-failed to create directory, use system tmp directory:".$target_dir."\n", FILE_APPEND); 
                              }
                              else
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 4.1-create directory succeeded\n", FILE_APPEND); 
                         }
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 10-target directory:".$target_dir."\n", FILE_APPEND);
                         $countfiles = count($_FILES['fileToUpload']['name']); // Get the number of files to upload
                         $images['NumOfFiles']=$countfiles;
                         $images['Uploaddir']=$target_dir."/";
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 11-Num of files to upload:".$countfiles."\n", FILE_APPEND);
                         $fileuploadcounter=0;
                         for ( $i=0; $i < $countfiles; $i++ ) { // loop throu the files
                              $file2upload = $_FILES['fileToUpload']['name'][$i];
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 12-file number:".$i." file name:".$file2upload."\n", FILE_APPEND); 
                            
                              $ret_code=UploadFile($_FILES["fileToUpload"]["tmp_name"][$i],$target_dir.'/'.basename($file2upload)); // Uplaod the file(s) to the target directory
                              if ($ret_code == 1) { // ret_code = 1 : file uploaded successfully 
                                   $images['Files'][$fileuploadcounter]['Status']=1;
                                   $images['Files'][$fileuploadcounter]['file2upload'.$i]=$file2upload;
                                   $images['Files'][$fileuploadcounter]['UploadedTime']=$current_time;
                                   $images['Files'][$fileuploadcounter]['Uploaddir']=$target_dir;
                                   $images['NumOfFiles']=$fileuploadcounter;

                                   $ret_status[$fileuploadcounter]["Status"] = 1; // return the project number 
                                   //$ret_status[$fileuploadcounter]["file2upload"] = $file2upload;
                                   //$ret_status[$fileuploadcounter]["Notes"] = "File uploaded successfully"; // just a placeholder
                                   //$ret_status[$fileuploadcounter]["UploadedTime"] = $today." ".$current_time; 
                                   $fileuploadcounter++;
                              }
                              else { // something went wrong with the DB
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 8-sql err:".mysqli_error($con)."\n", FILE_APPEND); 
                                   $images['Files'][$i]['Status']=-1; 
                                   $ret_status[0]["Status"] = -7; // fail
                                   $ret_status[0]["Notes"]  = "Internal error 7"; 
                              }
                         }
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 12.5- update ej with the new uploaded files\n", FILE_APPEND); 
                         $json_images=json_encode($images);
                         $sql_st="UPDATE employee_jobs SET job_signout='$t_signout', images_json='$json_images', file_uploaded = 1 where task_id='$task_id'";
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 13-sql st:".$sql_st."\n", FILE_APPEND); 
                         if (mysqli_query($con,$sql_st)) 
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 14-".$fileuploadcounter." file(s) successfully uploaded,# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                         else
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 8.5-update files failed:".mysqli_error($con)."\n", FILE_APPEND);
                    }
              
               
               case "signout"                : // continue to signout and calculate hours     
                   
                    // retrieve the most recent signin job that not closed of today
                    $task_id=$_POST['task_id'];   // Only when signin then task_id is populated 
                    $sql_st= "SELECT job_signin,project_number FROM employee_jobs
                                   WHERE employee_id='$employee_id' and job_closed='N' and task_id='$task_id'";
                   
                    $tasks=mysqli_query($con,$sql_st);
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 15-sql st:".$sql_st." numRec:". $tasks->num_rows."\n", FILE_APPEND); 
                    if ( $tasks->num_rows > 0 ) {
                         $row = mysqli_fetch_assoc($tasks);      // retrieve the record
                         $project_number=$row["project_number"]; // project nubmer is in 1st place
                         $max_signin=$row["job_signin"];
                         //$task_id=$row["task_id"];
                         $signin_found=1;
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 16-pNumber:".$project_number." MaxSignin:".$max_signin." eID:".$employee_id." taskID:".$task_id."\n", FILE_APPEND);

                         $timestampin = new DateTime($max_signin);
                         $timestampout = new DateTime();
                         
                         $interval = $timestampin->diff($timestampout);
                         $minutes = $interval->h * 60;
                         $minutes = $interval->i;
                         $hours=$interval->h;
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 17-hours:".$hours." minutes:".$minutes."\n", FILE_APPEND); 
                         if ( $hours < 1 ) 
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 18-hours is less than an hour\n".$sql_st."\n", FILE_APPEND); 
                         // Update employee_jobs table with the signout
                         if ( $minutes < 10)
                              $db_hours=$hours.".0".$minutes;
                         else
                              $db_hours=$hours.".".$minutes;
                         // db-hours is a temp variable to be used only to update the DB with the hours 

                         $sql_st="UPDATE employee_jobs SET job_signout='$t_signout', total_hours='$db_hours', job_progress ='signout', job_closed='Y' where job_signin='$max_signin' and project_number = '$project_number' and employee_id='$employee_id'";
                         if (mysqli_query($con,$sql_st)) {
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 19-update signout,hours and job_closed successfully\nsql_st:".$sql_st."\n", FILE_APPEND); 
                              // Update task_status to closed in the task_list table
                              $sql_st="UPDATE task_list SET task_status='closed' where project_name = '$project_number' and task_id='$task_id'";
                              if (mysqli_query($con,$sql_st)) 
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 20-update task_list successfully, sql_st:".$sql_st." # of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND); 
                              else {
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 9-update task_list failed, sql_st:".$sql_st." ".mysqli_error($con)."\n", FILE_APPEND); 
                                   $ret_status[0]["Status"] = -9; // fail
                                   $ret_status[0]["Notes"]  = "Internal error -9";
                              }
                         }
                         else {
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 10-Failed to update signout,hours and job_closed, sql_st:".$sql_st."\n", FILE_APPEND); 
                              $ret_status[0]["Status"] = -10; // fail
                              $ret_status[0]["Notes"] = "Internal error -10";
                         }

                         // Retrieve the current total employees labor of the particular job
                         $sql_st="SELECT project_total_empl_cost from projects where project_number = '$project_number'";
                         $empl_cost=mysqli_query($con,$sql_st);
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 21-sql st:".$sql_st." ret_row:".$empl_cost->num_rows."\n", FILE_APPEND);
                         $hourly_rate=15;
                         if ( $empl_cost->num_rows > 0 ) {
                              
                              $project_empl_cost = mysqli_fetch_row($empl_cost);
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 22-current empl_cost:".$project_empl_cost[0]." sql_st:".$sql_st."\n", FILE_APPEND);                        

                              $sql_st= "SELECT hourlyrate from employees where employee_id ='$employee_id'"; // get the employee's hourlyrate 
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 23-sql_st:".$sql_st."\n", FILE_APPEND);                        

                              $ret=mysqli_query($con,$sql_st);
                              $row = mysqli_fetch_assoc($ret);
                              switch  ( $ret->num_rows ) { 
                                   case 0: // FATAL error
                                        file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 11-No Hourly rate was found,use default $15\n", FILE_APPEND);       
                                        $hourly_rate=15;
                                        break;
                                   case 1: // Single rate found     
                                        $hourly_rate=$row["hourlyrate"];
                                   break;
                              }

                              $minutes_labor=round($minutes*($hourly_rate/60),2);
                              $job_labor=round($hours*$hourly_rate,2);
                              
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 24-hourly rate:".$hourly_rate." total hours:".$hours.$minutes." job labor:".$job_labor." New total project labor:". round($project_empl_cost[0],2)+$job_labor."\n", FILE_APPEND);
                              $overtime=0;
                              if ( $hours > 8 ) {// is there over time
                                   $overtime=floor(($hours-8)*($hourly_rate*0.5));
                                   $minutes_labor=round($minutes*($hourly_rate*0.5/60),2);
                              }
                              $job_labor += $overtime+$minutes_labor;

                              $project_empl_cost[0]+= $job_labor; // add the new labor to the current amount
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 25-over time:".$overtime." New total project labor:".round($project_empl_cost[0],2)."\n", FILE_APPEND);

                              // Update the labor cost of the job
                              $sql_st="UPDATE employee_jobs set labor_cost = '$job_labor' where task_id = '$task_id'";
                              if ( mysqli_query($con,$sql_st) ) 
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 26-update job labor sql_st:".$sql_st."\n", FILE_APPEND);

                              $sql_st="UPDATE projects set project_total_empl_cost = '$project_empl_cost[0]' where project_name = '$project_number'";
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 27-sql_st:".$sql_st."\n", FILE_APPEND);          
                              if ( mysqli_query($con,$sql_st) ) {
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." info 28-update project:".$project_number." total labor:".$project_empl_cost[0]."\n", FILE_APPEND);
                                   $ret_status[0]["Status"] = substr($project_number,0,4); // return the project number only
                              }
                              else {
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 12-Updtating DB failed, sql_st:".$sql_st."\n", FILE_APPEND);
                                   $ret_status[0]["Status"] = -12; // fail
                                   $ret_status[0]["Notes"]  = "Internal error -12";
                              }
                         } 
                         else {
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 13-project number:".$project_number."not found in projects - exit\n", FILE_APPEND);    
                              $ret_status[0]["Status"]= -13; // fail
                              $ret_status[0]["Notes"] = "Internal error -13"; 
                         }
                    } 
                    else {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log',"(insert_job2) ".$current_time." error 14-No records in closed status\n", FILE_APPEND);   
                         $ret_status[0]["Status"]= -14; // fail
                         $ret_status[0]["Notes"] = "Internal error -14"; 
                    }
                    break;

               case "signin"                 : 
                    
                    $t_signout=NULL;
                    $project_number=$_POST['project_number'];
                    $task_id=$_POST['task_id'];   // Only when signin then task_id is populated 
                    $sql_st="SELECT task_status from task_list where employee_id='$employee_id' and task_status='signin' and task_date like '$today%'";
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 29-sql_st:".$sql_st."\n", FILE_APPEND);  
                    $isSignin=mysqli_query($con,$sql_st);  
                    if ( $isSignin->num_rows == 0 ) { // make sure not any task is in sign in for the employee

                         //$sql_st="INSERT INTO employee_jobs (employee_id,project_number,job_progress,employee_fname,job_date,job_signin,job_signout,lunch_signin,lunch_signout,file_uploaded,task_id,job_closed) VALUES
                         //          ('$employee_id','$project_number','signin','$employee_fname','$today','$t_signin','00:00:00','00:00:00','00:00:00',0,'$task_id','N')";
                         $sql_st="UPDATE employee_jobs SET job_progress='signin', job_signin='$t_signin' where project_number = '$project_number' and task_id='$task_id'";
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 30-sql_st:".$sql_st."\n", FILE_APPEND);                    
                         if (mysqli_query($con,$sql_st)) {
                              $ret_status[0]["Status"] = substr($project_number,0,4);
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 31-update ej successfully\n", FILE_APPEND);
                              $sql_st="UPDATE task_list SET task_status='signin' where project_name = '$project_number' and task_id='$task_id'";
                              if (mysqli_query($con,$sql_st)) 
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 32-Update task_list successfully, sql_st:".$sql_st."\n", FILE_APPEND);
                              else { // error from the DB
                                   file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 14-Insert failed sql error:".mysqli_error($con)."\n", FILE_APPEND);
                                   $ret_status[0]["Status"] = -15; // fail
                                   $ret_status[0]["Notes"]  = "Internal error -15"; 
                              }
                         }
                         else { // error from the DB
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 15-Insert failed sql error:".mysqli_error($con)."\n", FILE_APPEND);
                              $ret_status[0]["Status"] = -16; // fail
                              $ret_status[0]["Notes"]  = "Internal error -16"; 
                         }
                    } 
                    else {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 16-Task is open\n", FILE_APPEND);
                         $ret_status[0]["Status"] = -17; // fail
                         $ret_status[0]["Notes"]  =  "Another task is already in progress"; 
                    }
               break;

               case "lunchIn"                : // Lunch in
                    $task_id=$_POST['task_id'];   // Only when signin then task_id is populated 
                    $sql_st="UPDATE employee_jobs SET lunch_signin='$t_signin',job_progress='lunchout' where task_id='$task_id'";
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 33-Update lunchIn,sql_st:".$sql_st."\n", FILE_APPEND);
                    if (mysqli_query($con,$sql_st)) {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 34-Update lunchIn successfully # of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                         $ret_status[0]["Status"] = 1; // Success
                    }
                    else {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 17-Failed to Lunch in, sql error:".mysqli_error($con)."\n", FILE_APPEND);
                         $ret_status[0]["Status"] = -18; // fail
                         $ret_status[0]["Notes"]  =  "Faield to lunch in"; 
                    }

                    $sql_st="UPDATE task_list SET task_status='lunchout' where task_id='$task_id'";    // mark the job as closed
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 35-sql_st:".$sql_st."\n", FILE_APPEND);
                    if ( mysqli_query($con,$sql_st) ) 
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 36-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                    else
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." warning 37-sql_error:".mysqli_error($con)."\n", FILE_APPEND);

               break;

               case "lunchOut"               :
                    $task_id=$_POST['task_id'];   // Only when signin then task_id is populated 
                    $sql_st="UPDATE employee_jobs SET lunch_signout='$t_signin',job_progress='lunchout' where task_id='$task_id'";
                    file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 38-Update lunchout,sql_st:".$sql_st."\n", FILE_APPEND);
                    if (mysqli_query($con,$sql_st)) {
                         $ret_status[0]["Status"] = 1; // Success
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 39-Update lunchout successfully # of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);

                         $sql_st="UPDATE task_list SET task_status='lunchout' where task_id='$task_id'";    // mark the job as closed
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 40-sql_st:".$sql_st."\n", FILE_APPEND);
                         if ( mysqli_query($con,$sql_st) ) 
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." info 41-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                         else
                              file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." warning 42-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                    }
                    else {
                         file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insert_job2) ".$current_time." error 19-Failed to Lunch in, sql error:".mysqli_error($con)."\n", FILE_APPEND);
                         $ret_status[0]["Status"] = -19; // fail
                         $ret_status[0]["Notes"]  =  "Faield to lunch out"; 
                    }
               
               break;
          }
     }
     else {
          file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2) ".$current_time."error 20-No Calltype is set - exit\n", FILE_APPEND);
          $ret_status[0]["Status"] = -20; // fail
          $ret_status[0]["Notes"]  = "Internal error 20"; 
     }
     mysqli_close($con);     
     file_put_contents('../log/log_'.$logDate.'.log', "(insert_job2.php) ".$current_time." info 99-ret_value".print_r($ret_status,true)."\n", FILE_APPEND);      
     echo json_encode($ret_status); // return results

     // function to upload files from the local device to the server
     function UploadFile($source_file,$target_file) {
          global $current_time;
          global $logDate,$employee_id;
          $fileupload_res=true; // file upload result default fail

          file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insertjob-UploadFile2) ".$current_time." info 43-inside uploadfile2 "." src:".$source_file." dst:".$target_file."\n", FILE_APPEND);
          if (move_uploaded_file($source_file, $target_file)) // upload the file($source_file, $target_file)) // upload the file
               file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insertjob-UploadFile2) ".$current_time." info 44-src:".$source_file." trgt:".$target_file." upload successfully\n", FILE_APPEND);
          else { // failed to upload the file
               $fileupload_res=false;
               file_put_contents('../log/log_'.$logDate."-".$employee_id.'.log', "(insertjob-UploadFile2) ".$current_time." error 21-src:".$source_file." trgt:".$target_file." upload failed\n", FILE_APPEND);
          }
          return $fileupload_res;     
     }
?>