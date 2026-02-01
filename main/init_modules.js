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


   async function readFilesSequentially(onProgress) {
     
      const delayPerFile = 2500; // 2.5 seconds per file = 10 seconds total for 4 files
      
      for (let i = 0; i < classModules.arr.length; i++) {
        const url = classModules.arr[i].module_file;
        
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
          const content = await response.text();
          
          results.push({ url, content });
          
          // Update progress
          if (onProgress) {
            onProgress(i + 1, classModules.arr.length, url);
          }
          
          // Add delay before next file (except after the last file)
          if (i < classModules.arr.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayPerFile));
          }
        } catch (error) {
          console.error(`Error reading ${url}:`, error);
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
        document.getElementById('content').innerHTML = 
          '<h1 style="color: #f44336;">Error loading files</h1><p>' + error.message + '</p>';
        document
        .getElementById('content').classList.remove('hidden');
      }
    }
