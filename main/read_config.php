<?php
    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");

    $ret_recs = array();
    
    if ( mysqli_connect_errno() == 0 ) {
        $sql_st= "SELECT * FROM configuration;";
        $paramters=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_config) ".$current_time." info 2-Num of rows:".$paramters->num_rows."\n", FILE_APPEND); 
        if ( $paramters->num_rows > 0 ) {
             $row = mysqli_fetch_assoc($paramters);
             $ret_recs[1] =  array("environment"                     =>  $row["environment"],
                                   "debug_level"                     =>  $row["debug_level"],
                                   "logins_polling_interval"         =>  $row["logins_polling_interval"],
                                   "newTask_polling_interval"        =>  $row["newTask_polling_interval"],
                                   "taskStatus_polling_interval"     =>  $row["taskStatus_polling_interval"],
                                   "app_version"                     =>  $row["app_version"],
                                   "db_version"                      =>  $row["db_version"],
                                   "maxUploadFileSize"               =>  $row["maxUploadFileSize"],
                                   "maxUAtasksInRow"                 =>  $row["maxUAtasksInRow"],
                                   "maxUArows"                       =>  $row["maxUArows"],
                                   "new_entry_max_depth"             =>  $row["new_entry_max_depth"],
                                   "default_profile_color"           =>  $row["default_profile_color"],
                                   "masterModuleAttributes"          =>  $row["masterModuleAttributes"]
                                );
            
            file_put_contents('../log/log_'.$logDate.'.log', "(read_config) ".$current_time." info 3-".print_r($ret_recs[1],true)."\n", FILE_APPEND); 
        }
        $ret_recs[0] = array("Status" => 1);  // Need to return for new employees
       
    } else {
        file_put_contents('../log/log_'.$logDate.'.log',"(read_config) ".$current_time." error 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
        $ret_recs[0] = array("Status" => 0);
    }

    $latestMFile=0;
    $recentFile ="";
    $di = new RecursiveDirectoryIterator('../');
    foreach (new RecursiveIteratorIterator($di) as $filename => $file) {
        if (  !(str_contains($filename,".git")      || 
                str_contains($filename,"backup")    ||
                str_contains($filename,"vscode")    ||
                str_contains($filename,"log_")      ||
                str_contains($filename,"DS_Store")  ||
                str_contains($filename,"utilities") ||
                $file->isDir())) {
                if ($file->getMTime() > $latestMFile) {
                    $latestMFile=$file->getMTime();
                    $recentFile=$file;
                }
        }
    }
    $ret_recs[2]=array( "filename"      =>  $recentFile->getFilename(),
                        "lastMdfyDate"  =>  date('n.j.Y', $recentFile->getMTime()));

    $sql_st= "SELECT * FROM folders";
    $folders=mysqli_query($con,$sql_st);
    file_put_contents('../log/log_'.$logDate.'.log', "(read_config) ".$current_time." info 2-Num of rows:".$folders->num_rows."\n", FILE_APPEND); 
    if ( $folders->num_rows > 0 ) {
        $row = mysqli_fetch_assoc($folders);
        $ret_recs['fldrs'] =  array("folders"   =>  $row["folders"]);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_config) ".$current_time." info 3-folders:".print_r($ret_recs['fldrs'],true)."\n", FILE_APPEND);         
    }

    mysqli_close($con);   // Close DB connectinn
    echo json_encode($ret_recs); // return results
  ?>