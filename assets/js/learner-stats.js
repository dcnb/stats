// learner-stats.js
class LearnerStats {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.stats = null;
  }

  async init() {
    try {
      const response = await fetch('/path/to/your/data.csv');
      const csvText = await response.text();
      await this.processData(csvText);
      this.render();
    } catch (error) {
      console.error('Error loading data:', error);
      this.container.innerHTML = '<div class="alert alert-danger" role="alert">Error loading data</div>';
    }
  }

  getDateRange(semester, year) {
    const ranges = {
      'Fall 2023': { start: new Date('2023-07-01'), end: new Date('2023-12-31') },
      'Spring 2024': { start: new Date('2024-01-01'), end: new Date('2024-06-30') },
      'Fall 2024': { start: new Date('2024-07-01'), end: new Date('2024-12-31') }
    };
    return ranges[`${semester} ${year}`];
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
    const processedData = parsedData.map(row => ({
      ...row,
      date: parseDate(row.date),
      count: parseInt(row.count) || 0,
      number_of_sessions: parseInt(row.number_of_sessions) || 1,
      workshop_type: row.workshop_type || ''
    }));

    const periods = ['Fall 2023', 'Spring 2024', 'Fall 2024'];
    
    const getStatsForPeriod = (startDate, endDate) => {
      const periodData = processedData.filter(row => 
        row.date && row.date >= startDate && row.date < endDate
      );

      const courseBased = periodData.filter(row => 
        row.category && row.category.includes('Course-based Instruction')
      );

      const workshops = periodData.filter(row => 
        row.category && row.category.includes('Workshop/Presentation')
      );

      const async = periodData.filter(row => 
        row.category && row.category.includes('Asynchronous')
      );

      const getCourseStats = (type) => {
        const filtered = courseBased.filter(row => row.type === type);
        return {
          sessions: filtered.length,
          attendees: filtered.reduce((sum, row) => sum + (row.count || 0), 0)
        };
      };

      const getWorkshopStats = (type) => {
        const filtered = workshops.filter(row => row.workshop_type === type);
        return {
          sessions: filtered.length,
          attendees: filtered.reduce((sum, row) => sum + (row.count || 0), 0)
        };
      };

      return {
        totalSessions: periodData.length,
        totalAttendees: periodData.reduce((sum, row) => sum + (row.count || 0), 0),
        
        courseBasedSessions: courseBased.length,
        courseBasedAttendees: courseBased.reduce((sum, row) => sum + ((row.count || 0) * (row.number_of_sessions || 1)), 0),
        uniqueCourseBasedAttendees: courseBased.reduce((sum, row) => sum + (row.count || 0), 0),
        
        english101102: getCourseStats('English 101 and 102'),
        upperDivision: getCourseStats('Upper Division an/or discipline specifi'),
        lowerDivision: getCourseStats('Lower Division'),
        k12: getCourseStats('K-12'),
        
        asyncSessions: async.length,
        asyncAttendees: async.reduce((sum, row) => sum + (row.count || 0), 0),
        
        workshopSessions: workshops.length,
        workshopAttendees: workshops.reduce((sum, row) => sum + (row.count || 0), 0),
        
        renfrewWorkshops: getWorkshopStats('Renfrew'),
        etilWorkshops: getWorkshopStats('ETIL'),
        techTalks: getWorkshopStats('Tech Talks'),
        gradEssentials: getWorkshopStats('Grad Student Essentials'),
        millWorkshops: getWorkshopStats('MILL Workshop')
      };
    };

    this.stats = periods.reduce((acc, period) => {
      const [semester, year] = period.split(' ');
      const range = this.getDateRange(semester, year);
      acc[period] = getStatsForPeriod(range.start, range.end);
      return acc;
    }, {});
  }

  render() {
    if (!this.stats) {
      this.container.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
      return;
    }

    const periods = ['Fall 2023', 'Spring 2024', 'Fall 2024'];
    const rows = [
      { label: 'Total Sessions', key: 'totalSessions' },
      { label: 'Total Attendees', key: 'totalAttendees' },
      { label: 'Total Course Based Sessions', key: 'courseBasedSessions' },
      { label: 'Total Course Based Attendees', key: 'courseBasedAttendees' },
      { label: 'Unique Course Based Attendees', key: 'uniqueCourseBasedAttendees' },
      { label: '-english 101 and 102', key: 'english101102', subkey: 'attendees' },
      { label: '-upper division an/or discipline specific', key: 'upperDivision', subkey: 'attendees' },
      { label: '-lower division and/or interdisciplinary', key: 'lowerDivision', subkey: 'attendees' },
      { label: '-k-12', key: 'k12', subkey: 'attendees' },
      { label: 'Total Asynchronous Sessions', key: 'asyncSessions' },
      { label: 'Total Asynchronous Attendees', key: 'asyncAttendees' },
      { label: 'Total Workshop Sessions', key: 'workshopSessions' },
      { label: 'Total Workshop Attendees', key: 'workshopAttendees' },
      { label: '- Renfrew Sessions', key: 'renfrewWorkshops', subkey: 'sessions' },
      { label: '- Renfrew Attendees', key: 'renfrewWorkshops', subkey: 'attendees' },
      { label: '- ETIL Sessions', key: 'etilWorkshops', subkey: 'sessions' },
      { label: '- ETIL Attendees', key: 'etilWorkshops', subkey: 'attendees' },
      { label: '- Tech Talks Sessions', key: 'techTalks', subkey: 'sessions' },
      { label: '- Tech Talks Attendees', key: 'techTalks', subkey: 'attendees' },
      { label: '- Grad Student Essentials Sessions', key: 'gradEssentials', subkey: 'sessions' },
      { label: '- Grad Student Essentials Attendees', key: 'gradEssentials', subkey: 'attendees' },
      { label: '- MILL Workshops Sessions', key: 'millWorkshops', subkey: 'sessions' },
      { label: '- MILL Workshops Attendees', key: 'millWorkshops', subkey: 'attendees' }
    ];

    const html = `
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Library Instruction Statistics</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead class="table-light">
                <tr>
                  <th scope="col">KPI Area</th>
                  ${periods.map(period => `<th scope="col" class="text-end">${period}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    <td>${row.label}</td>
                    ${periods.map(period => {
                      let value = row.subkey ? 
                        (this.stats[period][row.key]?.[row.subkey] || 0) : 
                        (this.stats[period][row.key] || 0);
                      return `<td class="text-end">${value.toLocaleString()}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}