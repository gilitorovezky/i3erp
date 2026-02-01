var modules=[];
var classModules="";

function init_modules() {

    windowLog.trace("Inside init_modules");


    $.ajax({url         : "../main/read_modules.php",
            method		: "POST",
            dataType	: "json",
            async       : false,  
            success		: function(data) {  
                if ( ( data != '' ) && 
                        ( Number(data[0].Status) > 0 ) ) {
                    classModules = new genesisClass(data,"modules",1); 
                    windowLog.trace("Load all Modules completed succesfully("+(classModules.arr.length)+")");
                }
                else 
                    windowLog.trace("error loading Modules, exit");
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load Moules failed:"+textStatus + ", " + error);
            })
    });

    return true;
}


function load_modules() {

    

}

