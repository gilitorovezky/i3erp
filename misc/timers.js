const loginInterval=60000;

function setLoginMonitorInterval() {

    windowLog.trace("set Login polling interval to "+(appConfig.loginPollingInterval+10)+"min");
    setInterval(function() {
        windowLog.trace("Polling logins");
        readLogins();
    },(appConfig.loginPollingInterval+10)*60*1000);
}