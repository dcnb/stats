// collection-charts.js
document.addEventListener('DOMContentLoaded', function() {
    // Create container for charts
    const container = document.getElementById('collection-charts');
    if (!container) return;

    // Create a responsive grid layout
    container.className = 'container-fluid';
    container.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <canvas id="totalCollectionsChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <canvas id="totalItemsChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <canvas id="collectionsAddedChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <canvas id="itemsAddedChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Function to parse numbers with commas
    const parseNumber = (str) => {
        if (!str) return 0;
        return parseInt(str.replace(/,/g, ''));
    };

    // Load and process the CSV data
    Papa.parse('assets/digital-collections.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const years = Object.keys(results.data[0])
                .filter(key => !isNaN(parseInt(key)))
                .sort();

            const data = {
                years: years,
                totalCollections: years.map(year => parseNumber(results.data[0][year])),
                totalItems: years.map(year => parseNumber(results.data[1][year])),
                collectionsAdded: years.map(year => parseNumber(results.data[2][year])),
                itemsAdded: years.map(year => parseNumber(results.data[3][year]))
            };

            createCharts(data);
        }
    });

    function createCharts(data) {
        // Common options for line charts
        const lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        // Common options for bar charts
        const barOptions = {
            ...lineOptions,
            plugins: {
                ...lineOptions.plugins,
                title: {
                    display: true,
                    position: 'top'
                }
            }
        };

        // Total Collections Line Chart
        new Chart(
            document.getElementById('totalCollectionsChart'),
            {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Total Collections',
                        data: data.totalCollections,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    ...lineOptions,
                    plugins: {
                        ...lineOptions.plugins,
                        title: {
                            display: true,
                            text: 'Total Collections Growth',
                            font: { size: 16 }
                        }
                    }
                }
            }
        );

        // Total Items Line Chart
        new Chart(
            document.getElementById('totalItemsChart'),
            {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Total Items',
                        data: data.totalItems,
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    ...lineOptions,
                    plugins: {
                        ...lineOptions.plugins,
                        title: {
                            display: true,
                            text: 'Total Items Growth',
                            font: { size: 16 }
                        }
                    }
                }
            }
        );

        // Collections Added Bar Chart
        new Chart(
            document.getElementById('collectionsAddedChart'),
            {
                type: 'bar',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Collections Added',
                        data: data.collectionsAdded,
                        backgroundColor: 'rgba(13, 110, 253, 0.7)'
                    }]
                },
                options: {
                    ...barOptions,
                    plugins: {
                        ...barOptions.plugins,
                        title: {
                            display: true,
                            text: 'Collections Added by Year',
                            font: { size: 16 }
                        }
                    }
                }
            }
        );

        // Items Added Bar Chart
        new Chart(
            document.getElementById('itemsAddedChart'),
            {
                type: 'bar',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Items Added',
                        data: data.itemsAdded,
                        backgroundColor: 'rgba(25, 135, 84, 0.7)'
                    }]
                },
                options: {
                    ...barOptions,
                    plugins: {
                        ...barOptions.plugins,
                        title: {
                            display: true,
                            text: 'Items Added by Year',
                            font: { size: 16 }
                        }
                    }
                }
            }
        );
    }
});