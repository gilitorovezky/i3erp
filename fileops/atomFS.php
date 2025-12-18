<?php
    ini_set('display_errors',0);
    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    $logDate= date("n.j.Y");

    function atomFS($operation,$src_dir,$rootFolder,$file,$target_dir) {
        global $logDate,$current_time;

        file_put_contents('../log/log_'.$logDate.'.log',"(atomFS) ".$current_time." info 1-ops:".$operation, FILE_APPEND);
 
        switch (strtolower($operation)) {

            case "rendir"   : 
                $ret_code=rename($src_dir,$target_dir);

                break;

            case "mkdir"    : 
                file_put_contents('../log/log_'.$logDate.'.log'," foldername:".$rootFolder, FILE_APPEND);
                $ret_code=mkdir($rootFolder,0777);
                break;
                
            case "copy"     :
                $ret_code=copy($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "move"     :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "delete"   :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file); // move the fiules to archieve, not actually delete
                break;

            default         :
                file_put_contents('../log/log_'.$logDate.'.log',"(atomFS.php) ".$current_time." error 1-".$operation." unrecognized operation:".$operation."\n", FILE_APPEND);
        }
        file_put_contents('../log/log_'.$logDate.'.log'," result:".$ret_code."\n", FILE_APPEND);
        return $ret_code;
    }
?>