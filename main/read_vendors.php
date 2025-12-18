<?php
    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    $logDate=date("n.j.Y");

    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log', "(read_vendors) ".$current_time." info 2-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        $file2upload="";
        $sql_st="SELECT * from vendors order by vendor_id ASC";
     
        $vendors=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_vendors) ".$current_time." info 3-Num of rows:".$vendors->num_rows."\n", FILE_APPEND); 

        $maxID=1;
        // if any records found
        if ( $vendors->num_rows > 0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($vendors)) {
                $maxID=max($maxID,$row["vendor_id"]);
                $ret_recs[$i] = array("vendor_id"      =>  $row["vendor_id"],
                                      "vendor_name"    =>  $row["vendor_name"],
                                      "vendor_address" =>  $row["vendor_address"],
                                      "notes"          =>  $row["notes"],
                                      "file_uploaded"  =>  $row["file_uploaded"],
                                      "images_json"    =>  $row["images_json"],);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_vendors) ".$current_time." info 4-rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array("Status" => 1,
                            "maxID" => $maxID);  // Need to returfor new employeesn         
        mysqli_close($con);   // Close DB connectin      
    }
    else 
        $ret_recs[0] = array("Status"  => -2, // fail
                             "Notes"   => "General Error");
    echo json_encode($ret_recs); // return results
  ?>