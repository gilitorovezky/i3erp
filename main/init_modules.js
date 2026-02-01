var modules=[];
var classModules="";
 const results = [];

function initModules() {

    let retCode=false;

    windowLog.trace("Inside init_modules");


    $.ajax({url         : "../main/read_modules.php",
            method		: "POST",
            dataType	: "json",
            async       : false,  
            success		: function(data) {  
                if ( ( data != '' ) && 
                     ( Number(data[0].Status) > 0 ) ) {
                    classModules = new genesisClass(data,"modules",1); 
                    windowLog.trace("Read modules table succesfully("+(classModules.arr.length)+")");
                    retCode=true;
                }
                else 
                    windowLog.trace("error loading Modules, exit");
            },
            error     	: (function (jqxhr, textStatus, error ) {
                windowLog.warn("Load Moules failed:"+textStatus + ", " + error);
            })
    });

    return retCode;
}


     function ajaxRequest(config) {
      //  const data2Send={config[data]};
      const value=Object.values(JSON.parse(config.data))[0];
      const key=Object.keys(JSON.parse(config.data))[0];
      var jsonObj = {};
          jsonObj[key]=value;
      return $.ajax({
        url         : config.module_file_url,
        type        : config.method || "POST",
        //data        : JSON.stringify({'projectNumber':'all'}),
        data        : JSON.stringify(jsonObj),
        async       : false,
        headers     : config.headers || {},
        dataType    : "json",
        contentType : config.contentType || 'application/json; charset=utf-8',
        success     : function(data, textStatus, xhr) {
            if (data[0].Status > 0)
                windowLog.trace("Loaded "+config.module_name+" succesfully");
            else
                windowLog.warn("Loaded "+config.module_name+" failed");
          // Success handled by promise
        },
        error: function(xhr, textStatus, errorThrown) {
          // Error handled by promise
        }
      });
    }

    async function readFilesSequentially(onProgress) {
      const results = [];
      const delayPerFile = 2500; // 2.5 seconds per file = 10 seconds total for 4 files
      
      for (let i = 0; i < classModules.arr.length; i++) {
        const request = classModules.arr[i];
        
        try {
          // Wait for this request to complete before moving to next
          const response = await ajaxRequest(request);
          
          results.push({
            url: request.url,
            method: request.method || 'GET',
            content: response
          });
          
          // Update progress
          if (onProgress) {
            onProgress(i + 1, classModules.arr.length, request.url);
          }
          
          // Add delay before next file (except after the last file)
          if (i < classModules.arr.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayPerFile));
          }
        } catch (error) {
            console.error(`Error reading ${request.url}:`, error);
          throw error;
        }
      }
      
      return results;
    }

    function updateProgress(current, total, url) {
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progressText');
      
      const percentage = (current / total) * 100;
      progressBar.style.width = percentage + '%';
      progressText.textContent = `Loading ${current}/${total}: ${url}`;
    }

    function hideProgress() {
      document.getElementById('progressContainer').classList.add('hidden');
    }


  async function loadModules() {

      try {
        const files = await readFilesSequentially(updateProgress);
        console.log('All files loaded:', files);
        
        // Hide progress bar and show content
        setTimeout(() => {
          hideProgress();
          //displayFiles(files);
        }, 500);
        
      } catch (error) {
        console.error('Failed to load files:', error);
        hideProgress();

      }
    }
