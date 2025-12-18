<?php

/*select 	UR.employee_id,
		R.role_id,
        R.role_name,
		P.permission_name
  from 	roles R,
		permissions P,
		role_permission RP,
		user_role UR
 where 	employee_id = '8'
	and	RP.permission_id = P.permission_id
	and UR.role_id = R.role_id 
    ddfdfd */
	$current_time=date("Y-m-d H:i:s");  

    require_once "../db/db_connect.php";
    file_put_contents('../log/log_'.$logDate.'.log', "(user_permissions.php) info 1: ".$current_time." inside user_permissions.php\n", FILE_APPEND); 
    
    $ret_tasks = array();

    file_put_contents('../log/log_'.$logDate.'.log', "(user_permissions) info 2: ".$current_time." sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
	$post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);
    
    $username=$sessionJSON['calltype'];
	
	$sql_st = "SELECT employee_id from accounts where username = '$username'";
	file_put_contents('../log/log_'.$logDate.'.log', "(user_permissions) ".$current_time." info 4-sql_st:".$sql_st."\n", FILE_APPEND);
	$employee=mysqli_query($con,$sql_st);
	if ( $employee->num_rows > 0 ) { // if any records found
		$row = mysqli_fetch_assoc($employee);
		$eID=$row["employee_id"];
		file_put_contents('../log/log_'.$logDate.'.log', "(user_permissions) ".$current_time." info 5-Num of rows:".$employee->num_rows." eID:".$eID."\n", FILE_APPEND); 
		$sql_st = "SELECT 	UR.employee_id,
						  	P.permission_name,
        				  	P.permission_id
					from	permissions P,
							user_role UR
					where 	UR.employee_id = '$eID'
					and		UR.permission_id = P.permission_id";
		$prmsns=mysqli_query($con,$sql_st);
		$anyRowCount=$prmsns->num_rows; 
		if ( $anyRowCount > 0 ) {
			$i=1;	// start from 1 to keep entry 0 to the return status
			while ($row = mysqli_fetch_assoc($prmsns)) {
				$ret_results[$i]=array( "permission_id"	=>    $row["permission_id"]);
				file_put_contents('../log/log_'.$logDate.'.log', "(load_task) ".$current_time." info 10-Rec Num:".$i." Rec:".print_r($ret_results[$i++],true)."\n", FILE_APPEND);
			}
		}
		$ret_results[0]=array("Status" => 1);  // Need to return for new employees
	} else
		$ret_results[0]=array("Status" => -1);  // Need to return for new employees

	mysqli_close($con);                          
	echo json_encode($ret_results); // return results
?>

