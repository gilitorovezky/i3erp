    //var myLoginID=0;
    function readLogins() {

        windowLog.trace("Inside readLogins-uID:"+uid);
        const json={'uID':uid};	            // set the parqmteres to sent to the server        
        var ret_post=$.post( "../main/read_logins.php",JSON.stringify(json));
        ret_post.done(function(result) {
            const id=Number(JSON.parse(result).uID);
            //const u_id=JSON.parse(result).
            windowLog.trace("read myID:"+id);
            //if ( myLoginID == 0 ) // first time
            //     myLoginID = login_id;
            //else     
            if ( id == 0 ) {
                windowLog.trace("Logout id:0");
                //logout();
            }
            //    }
        });
        ret_post.fail(function(result) {
            windowLog.warn("Failed to poll logins");
        });
    }