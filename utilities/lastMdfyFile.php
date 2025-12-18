<?php

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
            if ($file->getMTime() > $latestMFile) {
                $latestMFile=$file->getMTime();
                $recentFile=$file;
            }
        }
    }
    echo $recentFile->getFilename()." M Date:".date('n.j.Y', $recentFile->getMTime())."\n";

?>