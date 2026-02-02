<?php

    require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");

    $ret_recs = array();

    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);   
    $employee_id=$sessionJSON["employeeID"];
    file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) ".$current_time." info 2.1:".print_r($sessionJSON,true)."\n", FILE_APPEND);
    
    file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) info 1:".$current_time." sql connect error:".mysqli_connect_errno().", eID:".$employee_id."\n", FILE_APPEND); 
    if ( mysqli_connect_errno() == 0 ) {
        if ( $employee_id == "all") 
            $sql_st = "SELECT empl.fullname,hrh.employee_id,hrh.effective_date,hrh.hourlyrate,hrh.hr_id
                        FROM employees empl
                        INNER JOIN hourlyrate_history hrh
                        ON empl.employee_id  = hrh.employee_id 
						order by hrh.effective_date ASC";
        else
            $sql_st = "SELECT empl.fullname,hrh.employee_id,hrh.effective_date,hrh.hourlyrate,hrh.hr_id
                        FROM employees empl
                        INNER JOIN hourlyrate_history hrh
                        ON empl.employee_id  = hrh.employee_id 
                        and empl.employee_id =  $employee_id order by hrh.effective_date ASC";
        
        
        /*"SELECT empl.fullname,hrh.effective_date,hr.hourlyrate,hrh.hr_id
                   FROM employees empl
                   INNER JOIN hourlyrate_history hrh
                   ON empl.employee_id  = hrh.employee_id 
                   inner join hourly_rate hr
                   on hrh.hourlyrate_code = hr.hourlyrate_code
                   and empl.employee_id = $employee_id";*/
        //"SELECT * from hourlyrate_history where employee_id =$employee_id";
        file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) info 1.5:sql_st-".$sql_st."\n", FILE_APPEND); 
        $result = mysqli_query($con,$sql_st);
        file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) info 2:".$current_time." # of rows:".$result->num_rows."\n", FILE_APPEND); 
        
        if ( $result->num_rows > 0 ) {  //// if any records found
            $i=1;
            $ret_recs[0]=array("Status"=> 1);
            while ($row = mysqli_fetch_assoc($result)) {
                $ret_recs[$i] =  array( "fullname"       =>  $row["fullname"],
                                        "effective_date" =>  $row["effective_date"],
                                        "hourlyrate"     =>  $row["hourlyrate"],
                                        "hr_id"          =>  $row["hr_id"],
                                        "employee_id"    =>  $row["employee_id"], //$employee_id
                                        );
                
                file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) info 3:".$current_time." rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
            }
        }
        else {
            $ret_recs[0]=array("Status"  => -1, // fail
                               "Notes"   => "No Records");
            file_put_contents('../log/log_'.$logDate.'.log', "(read_hourlyrate) warning 3:".$current_time." No records found\n", FILE_APPEND); 
        }
    }
    else
        $ret_recs[0] = array("Status"  => -2, // fail
                             "Notes"   => "General Error");
    mysqli_close($con);   // Close DB connection   
    echo json_encode($ret_recs); // return results
  ?>