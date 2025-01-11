// instruction-charts.js
class InstructionCharts {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.charts = [];
    }
  
    async init() {
      try {
        const response = await fetch('/assets/instruction.csv');
        const csvText = await response.text();
        await this.processData(csvText);
        this.render();
      } catch (error) {
        console.error('Error loading data:', error);
        this.container.innerHTML = '<div class="alert alert-danger" role="alert">Error loading data</div>';
      }
    }
  
    getSemesterRange(semester, year) {
      const ranges = {
        'Fall': {
          start: new Date(year, 6, 1), // July 1
          end: new Date(year, 11, 31) // December 31
        },
        'Spring': {
          start: new Date(year, 0, 1), // January 1
          end: new Date(year, 5, 30) // June 30
        }
      };
      return ranges[semester];
    }
  
    async processData(csvText) {
      const parsedData = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data;
  
      // Helper function to parse dates
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      };
  
      // Process each row
      const processedData = parsedData
        .map(row => ({
          ...row,
          date: parseDate(row.date),
          count: parseInt(row.count) || 0,
          number_of_sessions: parseInt(row.number_of_sessions) || 1
        }))
        .filter(row => row.date);
  
      // Generate all semester periods from Fall 2016 to Fall 2024
      const periods = [];
      for (let year = 2016; year <= 2024; year++) {
        if (year > 2016) { // Start with Fall 2016, so only add Spring for subsequent years
          periods.push(`Spring ${year}`);
        }
        periods.push(`Fall ${year}`);
      }
  
      this.data = periods.map(period => {
        const [semester, year] = period.split(' ');
        const range = this.getSemesterRange(semester, parseInt(year));
  
        const periodData = processedData.filter(row => 
          row.date >= range.start && row.date <= range.end
        );
  
        const instruction = periodData.filter(row => 
          row.category && row.category.includes('Course-based Instruction')
        );
  
        const workshops = periodData.filter(row => 
          row.category && row.category.includes('Workshop/Presentation')
        );
  
        return {
          period,
          instructionSessions: instruction.reduce((sum, row) => sum + (row.number_of_sessions || 1), 0),
          instructionAttendees: instruction.reduce((sum, row) => sum + ((row.count || 0) * (row.number_of_sessions || 1)), 0),
          workshopSessions: workshops.length,
          workshopAttendees: workshops.reduce((sum, row) => sum + (row.count || 0), 0)
        };
      });
    }
  
    createChart(ctx, data, label, color) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.map(d => d.period),
          datasets: [{
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false
            }
          }
        }
      });
    }
  
    render() {
      // Create chart container
      const html = `
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Instruction Sessions Over Time</h5>
              </div>
              <div class="card-body">
                <div style="height: 300px">
                  <canvas id="instructionSessionsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Instruction Attendees Over Time</h5>
              </div>
              <div class="card-body">
                <div style="height: 300px">
                  <canvas id="instructionAttendeesChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Workshop Sessions Over Time</h5>
              </div>
              <div class="card-body">
                <div style="height: 300px">
                  <canvas id="workshopSessionsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Workshop Attendees Over Time</h5>
              </div>
              <div class="card-body">
                <div style="height: 300px">
                  <canvas id="workshopAttendeesChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  
      this.container.innerHTML = html;
  
      // Create charts
      this.createChart(
        document.getElementById('instructionSessionsChart'),
        this.data.map(d => d.instructionSessions),
        'Instruction Sessions',
        '#0d6efd'
      );
  
      this.createChart(
        document.getElementById('instructionAttendeesChart'),
        this.data.map(d => d.instructionAttendees),
        'Instruction Attendees',
        '#0dcaf0'
      );
  
      this.createChart(
        document.getElementById('workshopSessionsChart'),
        this.data.map(d => d.workshopSessions),
        'Workshop Sessions',
        '#198754'
      );
  
      this.createChart(
        document.getElementById('workshopAttendeesChart'),
        this.data.map(d => d.workshopAttendees),
        'Workshop Attendees',
        '#20c997'
      );
    }
  }