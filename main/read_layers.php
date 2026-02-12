<?php
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE

    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
    $ret_recs = array();

    header('Content-Type: application/json');
    file_put_contents('../log/log_'.$logDate.'.log', "(layers.php) ".$current_time." info 1-inside read_layers.php\n", FILE_APPEND); 

    $sql = "SELECT id, layer_name, layer_number, bg_color FROM layers";
    $result = $con->query($sql);

    if ($result) {
        $ret_recs  = $result->fetch_all(MYSQLI_ASSOC);
        file_put_contents('../log/log_'.$logDate.'.log',"(read_layers) ".$current_time." info 4-".print_r($ret_recs,true)."\n", FILE_APPEND); 
        echo json_encode($ret_recs );
    } else 
        echo json_encode(["error" => "Failed to fetch layers"]);

    $con->close();
?>