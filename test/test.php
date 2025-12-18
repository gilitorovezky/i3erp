<?php
 date_default_timezone_set("America/Los_Angeles");
  $current_time=date("m-d-Y H:i:s");
  $logDate= date("n.j.Y");
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
    echo $toFolder;
    //$src_dir = '"../uploads/".$fromFolder';
    //echo json_encode($out);
    //file_put_contents('log_'.$logDate.'.log',"(read_companies) ".$current_time." ".print_r($array,true)."\n", FILE_APPEND); 
?>