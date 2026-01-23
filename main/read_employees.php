<?php
    require_once "../db/db_connect.php";

    ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
    ini_set("error_log", "../log/php_error.log"); // LOG FILE
 
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate= date("n.j.Y");
   
    $ret_recs = array();
    file_put_contents('../log/log_'.$logDate.'.log',"(read_employees) ".$current_time." info 2-sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 

    if ( mysqli_connect_errno() == 0 ) {

        $calltype=$_POST["calltype"]; // call type : sign in or signout
        if (isset($calltype)) { 
            file_put_contents('../log/log_'.$logDate.'.log',"(read_employees) ".$current_time." info 3-call type:".$calltype."\n", FILE_APPEND);
            if ( $calltype == 'all') {
                $file2upload="";
               
                $sql_st = "SELECT employee_id,username,fullname,hourlyrate,startdate,is_active,hourlyrate_effective_date,employment_type,password,file_uploaded,foldername,images_json,profile_color from employees
                order by case when fullname = 'jake'   then 1
                              when fullname = 'pedro'  then 2
                              when fullname = 'orel'   then 3
                              when fullname = 'dudu'   then 4
                              when fullname = 'carlos' then 5
                        end ";

                file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." info 4-sql_st:".$sql_st."\n", FILE_APPEND);
                $employee=mysqli_query($con,$sql_st);
                file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." info 5-Num of rows:".$employee->num_rows."\n", FILE_APPEND); 

                $maxID=1;
                // if any records found
                if ( $employee->num_rows > 0 ) {
                    $i=1;
                    while ($row = mysqli_fetch_assoc($employee)) {
                        $hr_since=0;
                        $maxID=max($maxID,$row["employee_id"]);
                        $ret_recs[$i] =  array("employee_id"         =>  $row["employee_id"],
                                                "username"           =>  $row["username"],
                                                "fullname"           =>  strtolower($row["fullname"]),                                           
                                                "employment_type"    =>  $row["employment_type"],
                                                "hourlyrate"         =>  $row["hourlyrate"],
                                                "effective_date"     =>  $row["hourlyrate_effective_date"],
                                                "is_active"          =>  $row["is_active"],
                                                "password"           =>  $row["password"],
                                                "file_uploaded"      =>  $row["file_uploaded"],
                                                "images_json"        =>  $row["images_json"],
                                                "foldername"         =>  $row["foldername"],
                                                "startdate"          =>  $row["startdate"],
                                                "profile_color"      =>  $row["profile_color"]); // default color
                        file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." info 6-rec #:".$i." ".print_r($ret_recs[$i++],true)."\n", FILE_APPEND); 
                    }
                    $ret_recs[0]=array("Status" => 1,
                                       "maxID"  => $maxID);  // Need to returfor new employeesn 
                }
            } else { // called by an individual username
                $username=$_POST['calltype'];
                $sql_st = "SELECT employee_id from accounts where username = '$username'";
                file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." info 4-sql_st:".$sql_st."\n", FILE_APPEND);
                $employee=mysqli_query($con,$sql_st);
                if ( $employee->num_rows > 0 ) { // if any records found
                    $row = mysqli_fetch_assoc($employee);
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." info 5-Num of rows:".$employee->num_rows." eID:".$row["employee_id"]."\n", FILE_APPEND); 
                    $ret_recs[]=array("Status"       => 1,
                                      "employee_id"  => $row["employee_id"]);  // Need to return for new employees
                } else {
                    file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." error 3-no username found\n", FILE_APPEND); 
                    $ret_recs[] = array("Status"    => -1, // fail
                                         "Notes"    => "General Error(3)");
                }
            }
        } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." error 4\n", FILE_APPEND); 
            $ret_recs[] = array("Status"  => "Fail", // fail
                                 "Notes"   => "General Error(4)");
        }
    } 
    else {
        file_put_contents('../log/log_'.$logDate.'.log', "(read_employees) ".$current_time." error 5\n", FILE_APPEND); 
        $ret_recs[] = array("Status"  => "Fail", // fail
                             "Notes"   => "General Error(5)");
    }
    mysqli_close($con);   // Close DB connectin
    echo json_encode($ret_recs,TRUE); // return results
  ?>