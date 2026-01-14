<?php
    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");

    $ret_recs = array();
    
    $projectNumber=str_replace("'","\'",$_POST["projectNumber"]); // projectNumber : all or projectNumber
    file_put_contents('../log/log_'.$logDate.'.log',"(read_purchases) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()." prjNumber:".$projectNumber."\n", FILE_APPEND); 
    if ( mysqli_connect_errno() == 0 ) {

        if ( $projectNumber =='all' )
            $sql_st= "SELECT * FROM purchases order by purchase_date ASC";
        else     
            $sql_st= "SELECT * FROM purchases where project_number = '$projectNumber' order by purchase_date ASC";
        //echo $sql_st;
        $employee_job=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_purchases) ".$current_time."info 2-Num of rows: ".$employee_job->num_rows."\n", FILE_APPEND); 

        $maxID=1;
        // if any records found
        if ( $employee_job->num_rows >0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($employee_job)) { 
                $maxID=max($maxID,$row["purchase_id"]);
                $ret_recs[$i] =  array("vendor_name"       =>  $row["vendor_name"],
                                       "purchase_number"   =>  $row["purchase_number"],
                                       "purchase_amount"   =>  $row["purchase_amount"],
                                       "purchase_date"     =>  $row["purchase_date"],
                                       "purchase_method"   =>  $row["purchase_method"],
                                       "project_number"    =>  $row["project_number"],
                                       "purchase_desc"     =>  $row["description"],
                                       "purchase_id"       =>  $row["purchase_id"],
                                       "file_uploaded"     =>  $row["file_uploaded"],
                                       "images_json"       =>  $row["images_json"],
                                       "foldername"        =>  $row["foldername"]);
               
                file_put_contents('../log/log_'.$logDate.'.log', "(read_purchases) ".$current_time." info 3-record #".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array("Status" => 1,
                           "maxID"  => $maxID);  // Need to return for new employees   
        mysqli_close($con);   // Close DB connection
    } else {
        file_put_contents('../log/log_'.$logDate.'.log', "(read_purchases) ".$current_time." error -1\n", FILE_APPEND); 
        $ret_recs[0] = array("Status"  => -1, // fail
                             "Notes"   => "General Error");
        }
    echo json_encode($ret_recs); // return results
  ?>