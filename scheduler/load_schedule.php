<?php

    $current_time=date("Y-m-d H:i:s");  

    require_once "../db/db_connect.php";
    file_put_contents('../log/log_'.date("j.n.Y").'.log', "(load_schedule.php) info 1: ".$current_time." inside load_schedule.php\n", FILE_APPEND); 
    
    $ret_tasks = array();

    $current_time=date("Y-m-d H:i:s");  
    file_put_contents('../log/log_'.date("j.n.Y").'.log', "(load_schedule) info 2: ".$current_time." sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
    if ( mysqli_connect_errno() == 0 ) {
      
            $sql_st= "SELECT distinct parentID, task_date, employee_name,project_number, project_name,task_description  FROM task_list order  by employee_name;";
            file_put_contents('../log/log_'.date("j.n.Y").'.log', "(load_schedule) info 3: ".$current_time." sql st: ".$sql_st."\n", FILE_APPEND); 
            $tasks=mysqli_query($con,$sql_st);
            if ($tasks->num_rows >0) {
                $i=0;
                //retrieve records
                while ($row = mysqli_fetch_row($tasks)) {
                   
                    $ret_tasks[$i]=array(   "seq_number"         =>  $row[0],
                                            "taskDate"           =>  $row[1],
                                            "employee_name"      =>  $row[2],
                                            "project_number"     =>  $row[3],
                                            "project_name"       =>  $row[4],
                                            "task_description"   =>  $row[5],
                                        );
                    file_put_contents('../log/log_'.date("j.n.Y").'.log', "(load_schedule) info 4: ".$current_time." record # :".$i." ".print_r($ret_tasks[$i++],true)."\n", FILE_APPEND); 
                    
                }
            }
    }
    
    $alldata=[];
    
    $index=0;
    // Prepare a multidimension table from the results from the DB
    for ( $i = 0; $i < count($ret_tasks); $i++ ) {
	    //echo $ret_tasks[$i]['parentID']."\n";
        //echo ($ret_tasks[$i]['parentID']." found!\n"); 
        $alldata[$index][] = $ret_tasks[$i];
        for ( $j=$i+1; $j< count($ret_tasks); $j++) { // search more other alike records
            if ($ret_tasks[$i]['parentID'] == $ret_tasks[$j]['parentID']) {
                //echo ($ret_tasks[$j]['parentID']." found!\n"); 
                $alldata[$index][] = $ret_tasks[$j];
                $i++;}
        }
        $index++;
    }    //var_dump($alldata);
    closeConnection("load_schedule"); // close the connection.. function in the db_connect module
    echo json_encode($alldata); // return results
  ?>