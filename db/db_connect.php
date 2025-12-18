<?php
      ini_set('display_errors',0);
      ini_set("log_errors", 1); // SAVE ERROR TO LOG FILE
      ini_set("error_log", "../log/php_error.log"); // LOG FILE
      $log="";
      date_default_timezone_set("America/Los_Angeles");
      $current_time=date("m-d-Y H:i:s");
      $logDate= date("n.j.Y");
      error_reporting(E_ALL & ~E_NOTICE);
      $environment="development";//"development";
      define("DB_PORT",3306);
      define("DB_CHARSET", "utf8");
      file_put_contents('../log/log_'.$logDate.'.log', "(db_connect) ".$current_time." info 1:inside db_connect(v2.3)\n" , FILE_APPEND);
      switch ($environment) {
            case "production"       :
                  define("DB_HOST", "72.167.106.207");
                  define("DB_USER", "y9v22C0nstruction");
                  define("DB_PASSWORD", "5t3ErFq1HH%");
                  define("DB_NAME", "y9_v2.2.3");      
                  break;
            
            case "staging"          :
                  define("DB_HOST", "72.167.106.207");
                  define("DB_USER", "y9v23C0nstruction");
                  define("DB_PASSWORD", "4EhqkVV78-!Kz");      
                  define("DB_NAME", "y9_v2.3");
                  break;

            case "development"      :
                  define("DB_HOST", "127.0.0.1");
                  define("DB_USER", "y9construction");
                  define("DB_PASSWORD", "inn@vati0n");
                  define("DB_NAME", "y9_v22");
      }

      //file_put_contents('../log/log_'.$logDate.'.log', "(db_connect) ".$current_time." info 1:inside db_connect(v2.22)"." DB_Name:".DB_NAME."\n" , FILE_APPEND);
      
      // Connecting to the DB
      try { 
            $con=mysqli_connect(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME,DB_PORT);
            if (mysqli_connect_errno()) {
                  file_put_contents('../log/log_'.$logDate.'.log', "(db_connect) ".$current_time." error 1-sql connect error:".mysqli_connect_error()."\n", FILE_APPEND);
                  echo json_encode ("Error : MySQL database connection failed ".mysqli_connect_error());
            } else 
                  file_put_contents('../log/log_'.$logDate.'.log', "(db_connect) ".$current_time." info 2:connected successfully,host info:".mysqli_get_host_info($con)."\n", FILE_APPEND);    
      } catch (Exception $ex) { 
            $log=$ex->getMessage();
            file_put_contents('../log/log_'.$logDate.'.log', "(db_connect) ".$current_time." error 2:".$log." sql connect error:".mysqli_connect_errno()."\n", FILE_APPEND); 
            $con=NULL;            
      }

      function closeConnection($module) {
            global $con,$logDate,$current_time;
            
            file_put_contents('../log/log_'.$logDate.'.log', "(".$module.") ".$current_time." closing conneciton\n", FILE_APPEND); 
            mysqli_close($con);   // Close DB connectin
      }
?>