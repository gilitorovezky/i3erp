
class VirtualScroll {
        constructor(options) {
            this.container = options.container;
            //this.tableBody = options.tableBody;
            this.spacerTop = options.spacerTop;
            //this.spacerBottom = options.spacerBottom;
            //this.recordInfo = options.recordInfo;
            
            this.allData = [];
            this.windowSize = options.windowSize || 50;
            this.buffer = options.buffer || 10;
            this.rowHeight = options.rowHeight || 45;
            this.visibleRows = options.buffer || 10;
            
            this.startIndex = 0;
            this.header="";
            this.footer="";
            this.endIndex = this.windowSize;
            
            this.isScrolling = false;
            this.scrollTimeout = null;
            
            //this.init();
        }

        setUpScrollEvent() {
            this.container.addEventListener('scroll', () => this.handleScroll());
        }

        // Load all data from server (simulated)
        async loadAllData(inArray) {
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
            }*/
            
            //this.render();
            //this.updateInfo();
        }

        handleScroll() {
            if (this.isScrolling) return;
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateVisibleRange();
            }, 50);
        }

        updateVisibleRange() {
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
                this.render();
                this.updateInfo();
            }
        }

        render() {
            this.isScrolling = true;
            
            // Calculate spacer heights
            const topHeight = this.startIndex * this.rowHeight;
            const bottomHeight = (this.allData.length - this.endIndex) * this.rowHeight;
            
            this.spacerTop.style.height = `${topHeight}px`;
            //this.spacerBottom.style.height = `${bottomHeight}px`;
            
            // Render visible rows
            const visibleData = this.allData.slice(this.startIndex, this.endIndex);
            //visibleData.join('') + this.footer;
            //this.tableBody.innerHTML = visibleData.map(record => `${record}`).join('');
            //this.tableBody.innerHTML += this.footer;
            this.tableBody.innerHTML = visibleData.join('') + this.footer;
            setTimeout(() => {
                this.isScrolling = false;
            }, 100);
        }

        updateInfo() {
            //const showing = this.endIndex - this.startIndex;
            //this.recordInfo.textContent = 
            //    `Showing ${this.startIndex + 1}-${this.endIndex} of ${this.allData.length} records (Rendering ${showing} rows)`;
        }

        updateWindowSize() {
            const input = document.getElementById('windowSize');
            const newSize = parseInt(input.value);
            
            if (newSize >= 10 && newSize <= 200) {
                this.windowSize = newSize;
                this.buffer = Math.floor(newSize * 0.2);
                this.updateVisibleRange();
            }
        }

        scrollToTop() {
            this.container.scrollTop = 0;
            this.startIndex = 0;
            this.endIndex = this.windowSize;
            this.render();
            //this.updateInfo();
        }

        scrollToBottom() {
            this.container.scrollTop = this.allData.length * this.rowHeight;
            this.updateVisibleRange();
        }

        scrollToRecord(recordId) {
            const index = this.allData.findIndex(r => r.id === recordId);
            if (index !== -1) {
                this.container.scrollTop = index * this.rowHeight;
                this.updateVisibleRange();
            }
        }
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
