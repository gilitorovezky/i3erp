<?php

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    require_once "db_connect.php";
    require_once "../fileops/atomFS.php";
    $logDate= date("n.j.Y");
    define("VERSION", "11-07-2024");
    //require_once ('../misc/email.php')
    file_put_contents('../log/log_'.$logDate.'.log', "(save_customer.php) ".$current_time." info 0: inside save_customer.php\n", FILE_APPEND); 
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    $post_body=$_POST["postData"];
    //$post_json = file_get_contents('php://input');
   

    $return_code=0;
    //$sessionJSON = json_decode($post_json, true);       $totalLabor=0;
    if ( mysqli_connect_errno() == 0 ) { // no error from the DB
        if ( isset($post_body) ) { 
            
            $return_code=1;
            $tableName = "customers";
            $sql_st = "REPLACE INTO $tableName SET ";
            $keys = array_keys($post_body);
            for($i=0; $i < count($keys); ++$i) {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_customer.php) ".$current_time." info 2:".$keys[$i].':'.$post_body[$keys[$i]] ."\n", FILE_APPEND); 
                //$new_value = str_replace("'","\'", $post_body[$row_number][$cell]); // escaping the field to support ' and "
                $sql_st .= $keys[$i]."='".$post_body[$keys[$i]]."',";
            }
            $sql_st = substr($sql_st, 0, -1); // Remove the last char ","
            file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." info 3-sql_st:".$sql_st."\n", FILE_APPEND);
            if (mysqli_query($con,$sql_st)) {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." info 4-# of affected rows:".mysqli_affected_rows($con)."\n", FILE_APPEND);
                $ret_recs=array("Status" => 1);                
            }
            else {
                file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." error 15-sql_error:".mysqli_error($con)."\n", FILE_APPEND);
                $ret_recs=array("Status" => -8);
            }
            //end_sms($task_date,$task_escription);
        }
        else {
            file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." error 16-No passing parameters found"."\n", FILE_APPEND);
            $ret_recs=array("Status" => -9);
        }
        closeConnection("save_customer");
        file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." info 36:return result:".$return_code."\n", FILE_APPEND);    
    }
    else {
        file_put_contents('../log/log_'.$logDate.'.log', "(save_customer) ".$current_time." error 17-Error reading DB"."\n", FILE_APPEND);
        $ret_recs=array("Status" => -10);
    }
    echo json_encode($ret_recs);

  ?>