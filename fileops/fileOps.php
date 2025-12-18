<?php
    require_once('atomFS.php');
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    file_put_contents('../log/log_'.$logDate.'.log', "(fileops) ".$current_time." info 1-inside fileops\n", FILE_APPEND); 
    $ret_results=array();
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);
    
    $arrLength=count($sessionJSON);
    //$toFolder=preg_replace('/\s/i', '%20', $sessionJSON['dstnFolder']);
    //$fromFolder= preg_replace('/\s/i', '%20', $sessionJSON['srcFolder']);
    $target_dir = $sessionJSON['dstnFolder'];
    $src_dir    = $sessionJSON['srcFolder'];
    $file       = $sessionJSON['filename'];
    $ops        = $sessionJSON['op'];

    file_put_contents('../log/log_'.$logDate.'.log', "(fileops.php) ".$current_time." info 2-Rec Num:".$arrLength." Rec:".print_r($sessionJSON,true)."\n", FILE_APPEND); 
    file_put_contents('../log/log_'.$logDate.'.log', "(fileops.php) ".$current_time." info 3-srcFolder:".$src_dir."\n", FILE_APPEND); 
    file_put_contents('../log/log_'.$logDate.'.log', "(fileops.php) ".$current_time." info 4-toFolder:".$target_dir."\n", FILE_APPEND); 

    if (file_exists($target_dir)) {
        file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php) ".$current_time." info 5-target dir:".$target_dir." exist\n", FILE_APPEND); 
        //file_put_contents('../log/log_'.$logDate.'.log',"(fileops.pho) ".$current_time." info 3:src dir:".$src_dir."\n", FILE_APPEND); 
        
        $ret_code=atomFS($ops,$src_dir,$target_dir,$file,$target_dir);
        /*switch ($ops) {

            case "mkdir"    : 
                $ret_code=mkdir($rootFolder.$new_project_name,0777);
            case "Copy"     :
                $ret_code=copy($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "Move"     :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "Delete"   :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file); // move the fiules to archieve, not actually delete
                break;

            default         :
                file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php) ".$current_time." error 1-".$ops." unrecognized operation:".$ops."\n", FILE_APPEND);
        }*/
        $out["Status"]=$ret_code;
        $out["fileName"]=$file;
        file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php) ".$current_time." info 6-".$ops." operation:".$ret_code."\n", FILE_APPEND);
    }
    else {
        $out["Status"]="Folder ".$target_dir." not exist";
        file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php) ".$current_time." error 2-target dir:".$target_dir." does not exist\n", FILE_APPEND); 
    }
    echo json_encode($out);
    //file_put_contents('log_'.$logDate.'.log',"(read_companies) ".$current_time." ".print_r($array,true)."\n", FILE_APPEND); 

    /*
       // function to upload files from the local device to the server
    function atomFS($operation,$src_dir,$rootFolder,$file,$target_dir) {
        global $logDate,$current_time;

        file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php-atomFS) ".$current_time." info 1-ops:".$operation."\n", FILE_APPEND);
 
        switch ($operation) {

            case "mkdir"    : 
                $ret_code=mkdir($rootFolder,0777);
            case "Copy"     :
                $ret_code=copy($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "Move"     :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file);
                break;

            case "Delete"   :
                $ret_code=rename($src_dir."/".$file,$target_dir."/".$file); // move the fiules to archieve, not actually delete
                break;

            default         :
                file_put_contents('../log/log_'.$logDate.'.log',"(fileops.php) ".$current_time." error 1-".$operation." unrecognized operation:".$operation."\n", FILE_APPEND);
        }
        return $ret_code;
    } */
?>