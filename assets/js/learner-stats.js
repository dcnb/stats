// learner-stats.js
class LearnerStats {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.stats = null;
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
      const processedData = parsedData.map(row => ({
        ...row,
        date: parseDate(row.date),
        count: parseInt(row.count) || 0,
        number_of_sessions: parseInt(row.number_of_sessions) || 1,
        workshop_type: row.workshop_type || ''
      }));
  
      // Generate all semester periods from Fall 2016 to Fall 2024
      const periods = [];
      for (let year = 2016; year <= 2024; year++) {
        if (year > 2016) { // Start with Fall 2016, so only add Spring for subsequent years
          periods.push(`Spring ${year}`);
        }
        periods.push(`Fall ${year}`);
      }
      
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
  
        const getCourseStats = (type) => {
          const filtered = courseBased.filter(row => row.type === type);
          const totalSessions = filtered.reduce((sum, row) => sum + (row.number_of_sessions || 1), 0);
          return {
            sessions: totalSessions,
            attendees: filtered.reduce((sum, row) => sum + ((row.count || 0) * (row.number_of_sessions || 1)), 0)
          };
        };
  
        const getWorkshopStats = (type) => {
          const filtered = workshops.filter(row => {
            // Normalize both strings for comparison
            const rowType = (row.workshop_type || '').trim().toLowerCase();
            const searchType = type.trim().toLowerCase();
            return rowType === searchType;
          });
          console.log(`Workshop type "${type}":`, filtered);
          return {
            sessions: filtered.length,
            attendees: filtered.reduce((sum, row) => sum + (row.count || 0), 0)
          };
        };
  
        return {
          totalSessions: periodData.reduce((sum, row) => sum + (row.number_of_sessions || 1), 0),
          totalAttendees: periodData.reduce((sum, row) => sum + ((row.count || 0) * (row.number_of_sessions || 1)), 0),
          
          courseBasedSessions: courseBased.reduce((sum, row) => sum + (row.number_of_sessions || 1), 0),
          courseBasedAttendees: courseBased.reduce((sum, row) => sum + ((row.count || 0) * (row.number_of_sessions || 1)), 0),
          uniqueCourseBasedAttendees: courseBased.reduce((sum, row) => sum + (row.count || 0), 0),
          
          english101102: getCourseStats('English 101 and 102'),
          upperDivision: getCourseStats('Upper Division and/or discipline specific'),
          lowerDivision: getCourseStats('Lower Division'),
          k12: getCourseStats('K-12'),
          
          workshopSessions: workshops.length,
          workshopAttendees: workshops.reduce((sum, row) => sum + (row.count || 0), 0),
          
          renfrewWorkshops: getWorkshopStats('Renfrew Colloquium'),
          etilWorkshops: getWorkshopStats('Information Landscape'),
          techTalks: getWorkshopStats('Tech Talk'),
          gradEssentials: getWorkshopStats('Grad Student Essentials Workshop'),
          millWorkshops: getWorkshopStats('MILL Workshop')
        };
      };
  
      this.stats = periods.map(period => {
        const [semester, year] = period.split(' ');
        const range = this.getSemesterRange(semester, parseInt(year));
        const stats = getStatsForPeriod(range.start, range.end);
        return {
          period,
          ...stats
        };
      });
    }
  
    render() {
      if (!this.stats) {
        this.container.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
        return;
      }
  
      const rows = [
        { label: 'Total Sessions', key: 'totalSessions' },
        { label: 'Total Attendees', key: 'totalAttendees' },
        { label: 'Total Course Based Sessions', key: 'courseBasedSessions' },
        { label: 'Total Course Based Attendees', key: 'courseBasedAttendees' },
        { label: 'Unique Course Based Attendees', key: 'uniqueCourseBasedAttendees' },
        { label: '-english 101 and 102 Sessions', key: 'english101102', subkey: 'sessions' },
        { label: '-english 101 and 102 Attendees', key: 'english101102', subkey: 'attendees' },
        { label: '-upper division and/or discipline specific Sessions', key: 'upperDivision', subkey: 'sessions' },
        { label: '-upper division and/or discipline specific Attendees', key: 'upperDivision', subkey: 'attendees' },
        { label: '-lower division and/or interdisciplinary Sessions', key: 'lowerDivision', subkey: 'sessions' },
        { label: '-lower division and/or interdisciplinary Attendees', key: 'lowerDivision', subkey: 'attendees' },
        { label: '-k-12 Sessions', key: 'k12', subkey: 'sessions' },
        { label: '-k-12 Attendees', key: 'k12', subkey: 'attendees' },
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
                    ${this.stats.map(stat => `<th scope="col" class="text-end">${stat.period}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row => `
                    <tr>
                      <td>${row.label}</td>
                      ${this.stats.map(stat => {
                        let value = row.subkey ? 
                          (stat[row.key]?.[row.subkey] || 0) : 
                          (stat[row.key] || 0);
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