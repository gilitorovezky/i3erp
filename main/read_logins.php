<?php
    
    require_once "../db/db_connect.php";  // Open DB connection

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time = date("m-d-Y H:i:s");
    $logDate = date("n.j.Y");
    $get_json = file_get_contents('php://input');
    $sessionJSON = json_decode($get_json, true);
    //$inputLoginID=$sessionJSON['loginID'];
    $uid=$sessionJSON['uID'];
    //$arrLength=count($sessionJSON);
    $today = date('Y-m-d');
    file_put_contents('../log/log_'.$logDate.'.log',"(read_logins) ".$current_time." info 1-uID:".$uid."\n", FILE_APPEND);
    $today = date('Y-m-d');
    $sql_st= "SELECT login_id,login_time,unique_id from logins where login_name = 'eddie' and login_status = 'login' and login_time like '%$today%' order by login_time ASC limit 1";
    file_put_contents('../log/log_'.$logDate.'.log', "(read_logins) ".$current_time." info 2-sql_st:".$sql_st."\n", FILE_APPEND); 
    $result=mysqli_query($con,$sql_st);
    if ( $result->num_rows > 0 ) {  // must find at least one, me
        $row=mysqli_fetch_assoc($result);
        $lID=$row["login_id"];
        $lastReadUid=$row["unique_id"];
        $lastLoginTime=$row["login_time"];
        file_put_contents('../log/log_'.$logDate.'.log', "(read_logins) ".$current_time." info 3-login found, id:".$lastReadUid." login_time:".$lastLoginTime." uid:".$uid."\n", FILE_APPEND); 
        if ( $lastReadUid != $uid ) {   // other session found, signal logout
            $ret_recs = array("uID"  => 0);
            $sql_st="INSERT INTO logins (login_name,login_status,unique_id) VALUES
                                ('eddie','logout','$lastReadUid')";
        }
        else  // only me, do nothing
            $ret_recs = array("uID"  => $lastReadUid);
        /*$sql_st= "UPDATE logins SET login_status = 'login' WHERE login_id ='$lID'";
        if ($result=mysqli_query($con,$sql_st))
            file_put_contents('../log/log_'.$logDate.'.log', "(read_logins) ".$current_time." info 4-change status to login, return ".$lID."\n", FILE_APPEND);
        else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_logins) ".$current_time." error 1-Failed to change status to login\n", FILE_APPEND);
            $ret_recs = array("loginID"  => 0);
        }*/
    } else {
        file_put_contents('../log/log_'.$logDate.'.log', "(read_logins) ".$current_time." error 1-No login found, return 0\n", FILE_APPEND); 
        $ret_recs = array("uID"  => 1);
    }
    //}

    mysqli_close($con);   // Close DB connection
    echo json_encode($ret_recs);
?>