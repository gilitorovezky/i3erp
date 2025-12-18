<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");

    $ret_recs = array();

    $projectNumber=str_replace("'","\'",$_POST["projectNumber"]); // projectNumber : all or projectNumber
    file_put_contents('../log/log_'.$logDate.'.log',"(read_payments) ".$current_time." info 1-sql connect error:".mysqli_connect_errno()." prjNumber:".$_POST["projectNumber"]."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {
        if ( $projectNumber =='all' )
            $sql_st="SELECT * FROM payments order by payment_date ASC";
        else
            // get only the payments relevant to the project
            $sql_st="SELECT * FROM payments where project_number = '$projectNumber' order by payment_date ASC";

        $payments=mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_payments) ".$current_time." info 2-# of rows:".$payments->num_rows."\n", FILE_APPEND); 

        // if any records found
        $maxID=1;
        if ( $payments->num_rows > 0 ) {
            $i=1;
            while ($row = mysqli_fetch_assoc($payments)) { 
                $maxID=max($maxID,$row["payment_id"]);
                $ret_recs[$i] =  array("payment_id"         =>  $row["payment_id"],
                                       //"customer_name"     =>  $row["customer_name"],
                                       "project_number"     =>  $row["project_number"],                                      
                                       "checknumber_cnf"    =>  $row["checknumber_cnf"],
                                       "payment_amount"     =>  $row["payment_amount"],
                                       "payment_date"       =>  $row["payment_date"],
                                       "description"        =>  $row["description"],
                                       "payment_method"     =>  $row["payment_method"],
                                       "file_uploaded"      =>  $row["file_uploaded"],
                                       "images_json"        =>  $row["images_json"],
                                       "foldername"         =>  $row["foldername"]);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_payments) ".$current_time." info 3-record #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        $ret_recs[0]=array("Status" => 1,
                           "maxID"  => $maxID);  // Need to returfor new employeesn  
        mysqli_close($con);   // Close DB connectin
    }
    else
        $ret_recs[0] = array("Status"  => -1, // fail
                             "Notes"   => "General Error");
    echo json_encode($ret_recs); // return results
  ?>