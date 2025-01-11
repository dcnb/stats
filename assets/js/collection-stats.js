// collections-stats.js

document.addEventListener('DOMContentLoaded', function() {
    // Create table container
    const container = document.createElement('div');
    container.className = 'table-responsive';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.className = 'table-dark';
    thead.innerHTML = `
        <tr>
            <th>Year</th>
            <th>Total Collections</th>
            <th>Total Items</th>
            <th>Collections Added</th>
            <th>Items Added</th>
        </tr>
    `;
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Function to format numbers with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    // Function to get year from date string
    function getYear(dateValue) {
        // Convert to string in case it's a number
        const dateStr = String(dateValue);
        // If the date string contains a hyphen (e.g., "2024-07"), use full date parsing
        if (dateStr.indexOf('-') !== -1) {
            return new Date(dateStr + '-01').getFullYear();
        }
        // If it's just a year, return it as a number
        return parseInt(dateStr);
    }
    
    // Function to process CSV data
    function processData(results) {
        const yearlyStats = {};
        
        // Process each row
        results.data.forEach(row => {
            if (row.created) {
                const year = getYear(row.created);
                const itemCount = parseInt(row.item_count) || 0;
                
                if (year >= 2008 && year <= 2024) {
                    if (!yearlyStats[year]) {
                        yearlyStats[year] = {
                            totalCollections: 0,
                            totalItems: 0,
                            collectionsAdded: 0,
                            itemsAdded: 0
                        };
                    }
                    yearlyStats[year].collectionsAdded++;
                    yearlyStats[year].itemsAdded += itemCount;
                }
            }
        });
        
        // Calculate running totals and create rows
        let runningCollections = 0;
        let runningItems = 0;
        
        for (let year = 2008; year <= 2024; year++) {
            const yearData = yearlyStats[year] || {
                collectionsAdded: 0,
                itemsAdded: 0
            };
            
            runningCollections += yearData.collectionsAdded;
            runningItems += yearData.itemsAdded;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${year}</td>
                <td>${formatNumber(runningCollections)}</td>
                <td>${formatNumber(runningItems)}</td>
                <td>${formatNumber(yearData.collectionsAdded)}</td>
                <td>${formatNumber(yearData.itemsAdded)}</td>
            `;
            
            tbody.appendChild(row);
        }
    }
    
    // Load and parse the CSV file
    Papa.parse('assets/collections-data.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            processData(results);
        },
        error: function(error) {
            console.error('Error reading CSV:', error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>';
        }
    });
    
    // Assemble the table
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add the table to the page
    const targetElement = document.getElementById('collections-stats');
    if (targetElement) {
        targetElement.appendChild(container);
    }
});