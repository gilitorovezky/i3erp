<?php

date_default_timezone_set("America/Los_Angeles");
$current_time=date("m-d-Y H:i:s");  
//require_once "../misc/db_connect.php";
$logDate= date("n.j.Y");
$date=date("Y-m-d");

    $temp_dir = sys_get_temp_dir();
    //echo $temp_dir;
    
    //$prjNumber='1005-friendly remodeling-ww---';
    //echo $prjNumber."\n";

    //$prjNumber=explode('-',$prjNumber); // extract the project number from the project name
    //$prjNumber = $prjNumber[0];
    //echo $prjNumber;
  
    $latestMFile=0;
    $recentFilename="";$recentFile="";
    $di = new RecursiveDirectoryIterator('../');
    foreach (new RecursiveIteratorIterator($di) as $filename => $file) {
        if ( !(str_contains($filename,".git") || 
            str_contains($filename,"backup") ||
            str_contains($filename,"vscode") ||
            str_contains($filename,"log_") ||
            str_contains($filename,"DS_Store") ||
            str_contains($filename,"utilities") ||

            $file->isDir())) {
                    //  echo $filename . ' - ' . $file->getSize() . ' bytes '.date('d m g:i a', $file->getMTime())."\n";
                if ($file->getMTime() > $latestMFile) {
                    $latestMFile=$file->getMTime();
                    //$recentFilename=$filename;
                    $recentFile=$file;
//                    echo $filename . ' - ' . $file->getSize() . ' bytes '."M Date:".date('n.j.Y', $file->getMTime())."\n";
                }
        }
    }
    echo $recentFile->getFilename().' - '. $recentFile->getSize() . ' bytes '."M Date:".date('n.j.Y', $recentFile->getMTime())."\n";


   // newProject();
    /*if ($con) {
        //newEmployeeJob();
        mysqli_close($con);   // Close DB connectin
    }   
    else
        echo "invalid connection"."\n";
    */
    function newProject() {
        global $con;
        global $current_time;
        global $logDate,$date;
        
        for ($projectid=1;$projectid<1401;$projectid++) {
            $projectnumber=1000+$projectid;
            $projectname=$projectnumber."---";
            $sql_st= "INSERT INTO projects (project_id,project_number,project_name,project_date_created) VALUES ('$projectid','$projectnumber','$projectname','$date');";
            if (mysqli_query($con,$sql_st))  
                file_put_contents('../log/log_newPrj'.$logDate.'.log', "info 2:".$current_time." pID:".$projectid." sql err:".mysqli_connect_errno()."\n", FILE_APPEND); 
            }
    }

    function newEmployeeJob() {
        global $con;
        global $current_time;
        global $logDate;
        $sql_st="select max(task_id) from employee_jobs";
        if ($row = mysqli_query($con,$sql_st))  {
            $row = mysqli_fetch_row($row);
            $max = $row[0];
            echo $max."\n";
            $max++;
            file_put_contents('../log/log_emplJob'.$logDate.'.log', "info 2:max  task_id:".$max."\n", FILE_APPEND); 
            for ($i=$max;$i<$max+100;$i++) {
                
                $sql_st= "REPLACE INTO employee_jobs SET task_id='$i',project_number='2400-dino---',employee_fname='',job_date='2024-02-08',job_signin='16:33',job_signout='16:33',total_hours='0.00',gas='1',file_uploaded='0'";
//                $sql_st= "REPLACE INTO employee_jobs SET task_id='$i',project_number='2409-th%h-galager-samama-',employee_fname='',job_date='2024-01-29',job_signin='16:33',job_signout='16:33',total_hours='0.00',gas='1',file_uploaded='0'";
                if (mysqli_query($con,$sql_st))  {
//                    file_put_contents('../log/log_emplJob'.$logDate.'.log', "(1400projects.php) info 2:".$current_time." pID:".$i." sql err:".mysqli_connect_errno()."\n", FILE_APPEND); 
                    echo "inserting ".$i."\n";
                }
            }
        }
    }

?>