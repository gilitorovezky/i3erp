<?php
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");
    $logDate=date("n.j.Y");
    file_put_contents('../log/log_'.$logDate.'.log', "(dir.php) ".$current_time." info 1-inside dir.php\n", FILE_APPEND); 
    $ret_results=array();
    $post_json = file_get_contents('php://input');
    $sessionJSON = json_decode($post_json, true);
    
    $arrLength=count($sessionJSON);
    $prjNumber=$sessionJSON['prjNumber'];
    $rootDir=$sessionJSON['rootDir'];
    file_put_contents('../log/log_'.$logDate.'.log', "(dir.php) ".$current_time." info 2-Rec Num:".$arrLength." Rec:".print_r($sessionJSON,true)."\n", FILE_APPEND); 
   // $elements = ;
    //$array=json_decode($_POST['elements']);
    //$elements = explode(',', $elements);
    //echo $elements;

    if ( $prjNumber != 0)   // 0 indicates root folder, in that case just ignore
        $target_dir = $rootDir.$prjNumber;
    else
        $target_dir = $rootDir;
    if (file_exists($target_dir)) {
        file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." info 3:target dir:".$target_dir."\n", FILE_APPEND); 
        $tree="";
        $dIx=0;
        $fIx=0;
        listFolderFiles($target_dir);

        $out = array();
        $out[]["Status"]=1;
    }
    else {
        $out[]["Status"]="empty folder";
        file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." error 1-target dir: ".$target_dir." does not exist\n", FILE_APPEND); 
    }

    function listFolderFiles($dir)
    {
        global $tree,$logDate,$current_time,$fIx,$dIx;

        file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." inside listFolderFiles: (1)".$dir."\n", FILE_APPEND); 
        $fileFolderList = scandir($dir);
        //$scanned_directory = array_diff(scandir($fileFolderList), array('..', '.'));
        $tree .= '<ul>';
        foreach ($fileFolderList as $fileFolder) {
            
            if ($fileFolder != '.' && $fileFolder != '..' && $fileFolder != '.DS_Store' ) {

                if (is_dir($dir.'/'.$fileFolder)) {                   
                    $tree .='<li id="d_'.$dIx.'_'.$fileFolder.'">'.$fileFolder;
                    file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." inside listFolderFiles (2): folder-".$dir.$dIx."_".$fileFolder."\n", FILE_APPEND);
                    $dIx++;
                    listFolderFiles($dir.'/'.$fileFolder);
                }
                else {
                    $tree .= '<li id="f_'.$fIx."_".$fileFolder.'">'.$fileFolder;
                    $fIx++;
                    file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." inside listFolderFiles (3): file-".$dir."/".$fIx."-".$fileFolder."\n", FILE_APPEND);
                }
                $tree .= '</li>';
            }
        }
        $tree .= '</ul>';
    }

    file_put_contents('../log/log_'.$logDate.'.log',"(dir.pho) ".$current_time." tree=".$tree."\n", FILE_APPEND); 
    $out[] = $tree;
    echo json_encode($out);
    //file_put_contents('log_'.$logDate.'.log',"(read_companies) ".$current_time." ".print_r($array,true)."\n", FILE_APPEND); 
?>