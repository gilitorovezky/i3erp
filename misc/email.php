<?php

require 'vendor/autoload.php';
require 'vendor/phpmailer/phpmailer/src/Exception.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';


use PHPMailer\PHPMailer\PHPMailer;


    file_put_contents('../log/log_'.date("j.n.Y").'.log', "(email.php) info ".$current_time." inside email.php\n", FILE_APPEND); 

    $email = new PHPMailer(); 

    $email->isSMTP();
    $email->SMTPDebug = 1;
    $email->SMTPAuth = true;
    //$email->SMTPAutoTLS = FALSE;
    $email->SMTPSecure = "ssl";
    $email->Host = "smtpout.secureserver.net";
    $email->Port = 465;
    $email->Username = "gili@uptoro.com";
    $email->Password = "oR20KkNnk";

    $email->setFrom("do-not-reply@y9construction.com", "Y9 Scheduler");
    $email->isHTML(FALSE);
    $email->addAddress("9088215920@vtext.com", "ABC");

   // $email->addAddress("6194366527@mms.att.net", "ABC");
    $email->Subject = "Y9 Task testing";
    send_sms("Date","description");

   /* $email->Body = "This is MMS";
    $email->send();*/
/*catch (Exception $e)
{
     $email->ErrorInfo;
}*/

function send_sms($task_date,$task_description) {

  global $email,$current_time;

  file_put_contents('../log/log_'.date("j.n.Y").'.log', "(email.php) info 1".$current_time." sending txt ".$task_date." ".$task_description."\n", FILE_APPEND); 
  $email->Body = "new task: ".$task_date." ".$task_description;
  if ($email->send() == FALSE)
      file_put_contents('../log/log_'.date("j.n.Y").'.log', "(email.php) error 1".$current_time." sending txt failed ".$task_date." ".$email->ErrorInfo, FILE_APPEND); 
    else
      file_put_contents('../log/log_'.date("j.n.Y").'.log', "(email.php) info 2: ".$current_time." Text sent successfully\n", FILE_APPEND); 
}


?>