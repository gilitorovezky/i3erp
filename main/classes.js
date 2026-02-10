
class VirtualScroll {
        constructor(options) {
            this.viewport = document.getElementById('scrollDivID');
            //this.viewport.onscroll=this.updateTable;
            this.viewport.searchBar=document.getElementById('search-bar');
            this.viewport.searchBar.oninput=this.onSearchBarInput;
            this.viewport.scrollTop = 0;
            //this.tableBody = options.tableBody;
            this.renderTarget = document.getElementById('render-target');
            this.spacer = document.getElementById('spacer');
            
            this.filteredData = [];
            this.windowSize = options.windowSize || 50;
            this.rowHeight = options.rowHeight || 10;
            this.visibleRows = options.visibleRows || 40;
            
            this.startIndex = 0;
            this.header="";
            this.footer="";            
            this.isScrolling = false;
            this.scrollTimeout = null;
        

        /*setUpScrollEvent() {
            //this.container.addEventListener('scroll', () => this.handleScroll());
        }*/

        // Load all data from server (simulated)
        /*async loadAllData(inArray) {
            // Simulate loading data from PHP/MySQL
            // In real implementation: fetch('api/get_all_records.php')
            
            //this.recordInfo.textContent = 'Loading data...';
            
            // Simulate API delay
            //await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate sample data (replace with actual fetch call)
            //const totalRecords = 1000;
            this.allData = [...inArray]; // Copy it!
            
            /*for (let i = 1; i <= totalRecords; i++) {
                this.allData.push({
                    id: i,
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending',
                    created: new Date(2024, 0, i % 28 + 1).toLocaleDateString()
                });
            }
            
            //this.updateInfo();
        }*/

        /*handleScroll() {
            if (this.isScrolling) return;
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateVisibleRange();
            }, 50);
        }*/

        /*updateVisibleRange() {
            const scrollTop = this.container.scrollTop;
            const containerHeight = this.container.clientHeight;
            
            // Calculate which records should be visible
            const scrollIndex = Math.floor(scrollTop / this.rowHeight);
            const visibleCount = Math.ceil(containerHeight / this.rowHeight);
            
            // Add buffer for smooth scrolling
            const newStart = Math.max(0, scrollIndex - this.buffer);
            const newEnd = Math.min(
                this.allData.length,
                scrollIndex + visibleCount + this.buffer
            );
            
            // Only update if the range changed significantly
            if (newStart !== this.startIndex || newEnd !== this.endIndex) {
                this.startIndex = newStart;
                this.endIndex = newEnd;
                this.updateInfo();
            }
        }*/

        this.init =(inArray) => {

            this.filteredData = [...inArray];
        }
        this.updateTable = () =>{

           
            const count = this.filteredData.length;
            spacer.style.height = (count * this.rowHeight) + "px";
            
            const scrollTop = this.viewport.scrollTop;
            let startIndex = Math.floor(scrollTop / this.rowHeight);
            
            // Limit startIndex so we don't go off the end
            startIndex = Math.min(Math.max(0, startIndex), count - this.visibleRows);
            let endIndex = Math.min(count, startIndex + this.visibleRows + 5);

            const paddingTop = startIndex * this.rowHeight;
            const visibleSlice = this.filteredData.slice(startIndex, endIndex);

            let html = '';

            // ONLY add the top spacer if we have actually scrolled down
            if (startIndex > 0) {
                const paddingTop = startIndex * this.rowHeight;
                html += '<tr style="height: ' + paddingTop + 'px;"><td colspan="3" style="border:none; padding:0;"></td></tr>';
            }

            html += visibleSlice.join(''); 

            // BOTTOM SPACER ROW
            const paddingBottom = Math.max(0, (count - endIndex) * this.rowHeight);
            if ( paddingBottom > 0 ) {
                html += '<tr style="height: ' + paddingBottom + 'px;"><td colspan="3" style="border:none; padding:0;"></td></tr>';
            }

            this.renderTarget.innerHTML = html;
        }
        }

        attachListener() {
            //window.addEventListener('scroll', this.updateTable);

            const scrollDiv = document.getElementById('scrollDivID');

            // 2. Define the action on scroll
            scrollDiv.onscroll = () => {
                this.updateTable();
            };
        }


        onSearchBarInput() {
            const term = e.target.value.toLowerCase();
            let searchResultArray=[];
            searchResultArray = classArray["Employee Jobs"].arr.filter(function(item) {
                return item.project_number.toLowerCase().indexOf(term) > -1;
            });
            viewport.scrollTop = 0;
            updateTable(searchResultArray);
        };        

        updateInfo() {
            //const showing = this.endIndex - this.startIndex;
            //this.recordInfo.textContent = 
            //    `Showing ${this.startIndex + 1}-${this.endIndex} of ${this.allData.length} records (Rendering ${showing} rows)`;
        }

        /*updateWindowSize() {
            const input = document.getElementById('windowSize');
            const newSize = parseInt(input.value);
            
            if (newSize >= 10 && newSize <= 200) {
                this.windowSize = newSize;
                this.buffer = Math.floor(newSize * 0.2);
                this.updateVisibleRange();
            }
        }*/

        /*scrollToTop() {
            this.container.scrollTop = 0;
            this.startIndex = 0;
            this.endIndex = this.windowSize;
            //this.updateInfo();
        }*/

        /*scrollToBottom() {
            this.container.scrollTop = this.allData.length * this.rowHeight;
            this.updateVisibleRange();
        }*/

        /*scrollToRecord(recordId) {
            const index = this.allData.findIndex(r => r.id === recordId);
            if (index !== -1) {
                this.container.scrollTop = index * this.rowHeight;
                this.updateVisibleRange();
            }
        }*/
    }


class classMainMenue {

    hide() {
        if ( !IsTaskInProgress ) {	//  if Task in progress dont hide the signout
            $('#upperRightQuadrant').hide();
        }
        else {
            $('#tHalf').hide();
            $('#upperRightQuadrant').show();
        }
        $('#upperLeft').hide();
    }

    show() {
        $('#upperLeft').show();
        if (username == 'eddie') {
            $('#upperRight').show(); // show/enable the uperright 
            $('#userFileUpload,#fileslabel').hide();
        }
        else {
            if ( IsTaskInProgress ) { // only if task in progress enablesignout and upload files
                $('#tHalf').hide();
                $('#upperRightQuadrant').show();
            }	
        }
    }
};
