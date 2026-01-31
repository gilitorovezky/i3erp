<?php
    //require_once "../db/db_connect.php";
    date_default_timezone_set("America/Los_Angeles");
    $current_time=date("m-d-Y H:i:s");  
    $logDate=date("n.j.Y");
    $status = array();
    $user_agent=$_SERVER['HTTP_USER_AGENT'];
    file_put_contents('../log/log_'.$logDate.'.log', "(authenticate) ".$current_time." info 0:".$user_agent."\n" , FILE_APPEND);
  
    $onError = function ($level, $message, $file, $line) {
        throw new ErrorException($message, 0, $level, $file, $line);
    };

    $bar = 0;
    try {
        set_error_handler($onError);
        $bar = include "../db/db_connect.php";
        if ( $bar == 1 ) {
            if ( $con != NULL ) {
                if ( isset($_POST['username'],$_POST['password']) ) {
                    $username=$_POST['username'];
                    $input_password=$_POST['password'];
                    $unique_id=rand();
                    file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." info 1-username:".$username." u_id:".$unique_id."\n", FILE_APPEND); 
                    $sql_st="INSERT INTO logins (login_name,login_user_agent,login_status,unique_id) VALUES
                                    ('$username','$user_agent','login','$unique_id')";
                    $login=mysqli_query($con,$sql_st);
                    if ( $login != false ) {
                        file_put_contents('../log/log_'.$logDate.'.log',"(authenticate.php) ".$current_time." info 2-sql st:".$sql_st." ret_res:".$login."\n", FILE_APPEND); 
                
                        if ($stmt = $con->prepare('SELECT id, password, employee_id, fullname FROM accounts WHERE username = ?')) {
                            // Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
                            $stmt->bind_param('s', $username);
                            $stmt->execute();
                            $stmt->store_result();  // Store the result so we can check if the account exists in the database.
                            file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." info 3-num of rows:".$stmt->num_rows."\n", FILE_APPEND);
                            if ($stmt->num_rows > 0) {
                                $stmt->bind_result($id, $password,$employee_id,$fullname);
                                $stmt->fetch();
                                file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." info 4-username found:".$username."\n", FILE_APPEND); 
                                // Account exists, now we verify the password.
                                // Note: remember to use password_hash in your registration file to store the hashed passwords.
                                if (password_verify($input_password, $password)) {
                                    file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." info 5-password matches:".$fullname." eID:".$employee_id." redirecting..\n", FILE_APPEND); 
                                    //header('Location: ../login/home.html#home'); // 
                                    $status = array("result"         => 1,
                                                    "description"    => "User authenticated",
                                                    "uid"            => $unique_id);
                                }  
                                else { // Incorrect password
                                    file_put_contents('../log/log_'.$logDate.'.log',"(authenticate.php) ".$current_time." error 1-Incorrect Username or Password\n", FILE_APPEND); 
                                    $status =  array("result"      => -1,
                                                     "description" => "Incorrect Username or Password");
                                }
                            } 
                            else { // Incorrect username
                                file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 2-Incorrect Username or Password\n", FILE_APPEND); 
                                $status = array("result"        => -2,
                                                "description"   => "Incorrect Username or Password");
                            }   
                            $stmt->close();
                        } 
                        else {
                                file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 3-failed to prepare statement\n", FILE_APPEND); 
                                $status =  array("result"       => -3,
                                                 "description"  => "General error(3)");
                        }
                    } else  {   // error writing to the db
                        file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 4-dB error\n", FILE_APPEND); 
                        $status = array("result"        => -4,
                                        "description"   => "General error(4)");
                    }
                } else {  // error eith DB connection, abort
                    file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 5-Incorrect Username or Password\n", FILE_APPEND); 
                    $status = array("result"        => -5,
                                    "description"   => "Incorrect Username or Password");
                }
            } else {
                file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 6-invalid DB connection\n", FILE_APPEND); 
                $status = array("result"         => -6,
                                "description"    => "General error(6)");
            }
            closeConnection("authenticate"); // closse the connection.. function in the db_connect mopdule
        } else {
            file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 7-db_connect not found\n", FILE_APPEND); 
            $status = array("result"        => -7,
                            "description"   => "General error(7)");
        }
    }
    catch ( Exception $e ) {
        file_put_contents('../log/log_'.$logDate.'.log', "(authenticate.php) ".$current_time." error 8-db_connect not found\n", FILE_APPEND); 
        $status = array("result"        => -8,
                        "description"   => "General error(8)");
    }
    echo json_encode($status);
?>
