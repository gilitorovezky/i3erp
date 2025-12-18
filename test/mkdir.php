<?php
 date_default_timezone_set("America/Los_Angeles");
  $current_time=date("m-d-Y H:i:s");
  $logDate= date("n.j.Y");
  require_once "../db/db_connect.php";
  file_put_contents('../log/log_'.date("j.n.Y").'.log', "mkdir.php) info 1: ".$current_time." inside load_schedule.php\n", FILE_APPEND); 
  ini_set('display_errors',0);
  ini_set('log_errors',1);
  ini_set('error_log','./custom.log');
  $ret_tasks = array();
   // $elements = ;
    //$array=json_decode($_POST['elements']);
    //$elements = explode(',', $elements);
    //echo $elements;
  /*  $out = array();
    $out[]["Status"]="Success";
    foreach (glob('*.*') as $filename) {
        $p = pathinfo($filename);
        //$out[] = $p['filename'];
        $out[] = $filename;
    }*/
    $toFolder='"../uploads/"."1001-y9 construction inc-AHK-PROGRAM-OREL-ROSELLE"';
    $target_dir = '"../uploads/".$toFolder';
    $sql_st= "SELECT * FROM folders";
    $folders=mysqli_query($con,$sql_st);
    $row = mysqli_fetch_assoc($folders);
        
    $ret_recs['fldrs'] =  $row["folders"];
    $arr=json_decode( $ret_recs['fldrs'],true);
    $arr2=$arr["project_folders"];
    var_dump($arr2);
    /*
    $sql_st = "SELECT project_name FROM projects";  // Must be ASC to have the last project number at the last position
    $projects=mysqli_query($con,$sql_st); 
    while ($row = mysqli_fetch_assoc($projects)) {
       // if ( $row["project_name"] == '2400-Optimal remodeling-roger---') {
            echo $row["project_name"]."\n";
            foreach ($arr2 as $key => $value) {
                $folder2create="../uploads/".$row["project_name"]."/".$arr2[$key];
                echo "now creating ".$folder2create;
                try {
                    if (!mkdir($folder2create,0777, true) ) 
                        echo "...Unsucessfuly\n";
                    else
                        echo "...sucessfuly\n";
                }
                catch (Exception $e) {
                    echo 'Caught exception: ',  $e->getMessage(), "\n";
                }
            }
        //}
    }   */
    mysqli_close($con);   // Close DB connectin
?>