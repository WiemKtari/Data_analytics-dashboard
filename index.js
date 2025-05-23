// Initialize charts for the overview page
function initPageCharts() {
    updateCharts(surveyData);
}

// Update charts with data
function updateCharts(data) {
    updateSummaryMetrics(data);
    createAgeTreatmentChart(data);
    createGenderChart(data);
    createCountryChart(data);
    createRemoteWorkChart(data);
}

// Update the summary metrics
function updateSummaryMetrics(data) {
    const treatmentRate = calculatePercentage(data, 'treatment', 'Yes');
    document.getElementById('treatment-rate').textContent = `${treatmentRate}%`;
    
    // Calculate work interference (combining all "interfere" responses)
    const interferenceData = data.filter(item => item.work_interfere && item.work_interfere !== 'Never');
    const interferenceRate = interferenceData.length > 0 ? 
        (interferenceData.length / data.length * 100).toFixed(1) : 0;
    document.getElementById('interference-rate').textContent = `${interferenceRate}%`;
}

function createAgeTreatmentChart(data) {
    // Clear previous chart
    d3.select('#age-treatment-chart').html('');
    
    const svg = d3.select('#age-treatment-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
    
    // Group data by age groups
    const ageGroups = [
        { name: '18-25', min: 18, max: 25 },
        { name: '26-35', min: 26, max: 35 },
        { name: '36-45', min: 36, max: 45 },
        { name: '46-55', min: 46, max: 55 },
        { name: '56+', min: 56, max: 100 }
    ];
    
    const processedData = ageGroups.map(group => {
        const groupData = data.filter(d => d.age >= group.min && d.age <= group.max);
        const treatmentYes = groupData.filter(d => d.treatment === 'Yes').length;
        const treatmentNo = groupData.filter(d => d.treatment === 'No').length;
        const total = groupData.length;
        
        return {
            ageGroup: group.name,
            treatmentYes: total > 0 ? (treatmentYes / total * 100) : 0,
            treatmentNo: total > 0 ? (treatmentNo / total * 100) : 0,
            total: total
        };
    }).filter(d => d.total > 0); // Only show groups with data
    
    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const width = document.getElementById('age-treatment-chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('age-treatment-chart').clientHeight - margin.top - margin.bottom;
    
    // Create chart
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(processedData.map(d => d.ageGroup))
        .range([0, width])
        .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([height, 0]);
    
    // Add bars for treatment yes
    chart.selectAll('.treatment-yes')
        .data(processedData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-yes')
        .attr('x', d => x(d.ageGroup))
        .attr('y', d => y(d.treatmentYes))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => height - y(d.treatmentYes))
        .attr('fill', '#4a6fa5')
        .on('mouseover', function(event, d) {
            showTooltip(event, `Age ${d.ageGroup}: ${d.treatmentYes.toFixed(1)}% sought treatment (${d.total} people)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add bars for treatment no
    chart.selectAll('.treatment-no')
        .data(processedData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-no')
        .attr('x', d => x(d.ageGroup) + x.bandwidth() / 2)
        .attr('y', d => y(d.treatmentNo))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => height - y(d.treatmentNo))
        .attr('fill', '#ff7e5f')
        .on('mouseover', function(event, d) {
            showTooltip(event, `Age ${d.ageGroup}: ${d.treatmentNo.toFixed(1)}% didn't seek treatment`);
        })
        .on('mouseout', hideTooltip);
    
    // Add X axis
    chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('y', 10)
        .attr('x', -5)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Add Y axis
    chart.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width / 2 - 50},${height + margin.top + 30})`);
    
    legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#4a6fa5');
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text('Sought Treatment');
    
    legend.append('rect')
        .attr('x', 150)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#ff7e5f');
    
    legend.append('text')
        .attr('x', 170)
        .attr('y', 12)
        .text('No Treatment');
}

function createGenderChart(data) {
    // Clear previous chart
    d3.select('#gender-chart').html('');
    
    const svg = d3.select('#gender-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
    
    // Process data - group by gender and treatment
    const genders = [...new Set(data.map(d => d.gender))].filter(Boolean);
    const genderData = genders.map(gender => {
        const genderItems = data.filter(d => d.gender === gender);
        const treatmentYes = genderItems.filter(d => d.treatment === 'Yes').length;
        const treatmentNo = genderItems.filter(d => d.treatment === 'No').length;
        const total = genderItems.length;
        
        return {
            gender,
            treatmentYes,
            treatmentNo,
            total
        };
    }).filter(d => d.total > 0); // Only show genders with data
    
    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const width = document.getElementById('gender-chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('gender-chart').clientHeight - margin.top - margin.bottom;
    
    // Create chart
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(genderData.map(d => d.gender))
        .range([0, width])
        .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(genderData, d => Math.max(d.treatmentYes, d.treatmentNo))])
        .nice()
        .range([height, 0]);
    
    // Add bars for treatment yes
    chart.selectAll('.treatment-yes')
        .data(genderData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-yes')
        .attr('x', d => x(d.gender))
        .attr('y', d => y(d.treatmentYes))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => height - y(d.treatmentYes))
        .attr('fill', '#4a6fa5')
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.gender}: ${d.treatmentYes} sought treatment (${Math.round(d.treatmentYes/d.total*100)}%)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add bars for treatment no
    chart.selectAll('.treatment-no')
        .data(genderData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-no')
        .attr('x', d => x(d.gender) + x.bandwidth() / 2)
        .attr('y', d => y(d.treatmentNo))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => height - y(d.treatmentNo))
        .attr('fill', '#ff7e5f')
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.gender}: ${d.treatmentNo} didn't seek treatment (${Math.round(d.treatmentNo/d.total*100)}%)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add X axis
    chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('y', 10)
        .attr('x', -5)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Add Y axis
    chart.append('g')
        .call(d3.axisLeft(y).ticks(5));
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width / 2 - 50},${height + margin.top + 30})`);
    
    legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#4a6fa5');
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text('Sought Treatment');
    
    legend.append('rect')
        .attr('x', 150)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#ff7e5f');
    
    legend.append('text')
        .attr('x', 170)
        .attr('y', 12)
        .text('No Treatment');
}

function createCountryChart(data) {
    // Clear previous chart
    d3.select('#country-chart').html('');
    
    const svg = d3.select('#country-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
    
    // Process data - get top 10 countries by count
    const countryCounts = d3.rollup(
        data,
        v => v.length,
        d => d.country
    );
    
    const topCountries = Array.from(countryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }));
    
    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = document.getElementById('country-chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('country-chart').clientHeight - margin.top - margin.bottom;
    
    // Create chart
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(topCountries.map(d => d.country))
        .range([0, width])
        .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(topCountries, d => d.count)])
        .nice()
        .range([height, 0]);
    
    // Add bars
    chart.selectAll('.country-bar')
        .data(topCountries)
        .enter()
        .append('rect')
        .attr('class', 'country-bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
        .attr('fill', '#4a6fa5')
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.country}: ${d.count} respondents (${Math.round(d.count/data.length*100)}%)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add X axis
    chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('y', 10)
        .attr('x', -5)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Add Y axis
    chart.append('g')
        .call(d3.axisLeft(y).ticks(5));
    
    // Add chart title
    chart.append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .text('Top 10 Countries by Respondents');
}

function createRemoteWorkChart(data) {
    // Clear previous chart
    d3.select('#remote-chart').html('');
    
    const svg = d3.select('#remote-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
    
    // Process data - remote work vs treatment
    const remoteData = [
        { type: 'Remote', treatmentYes: data.filter(d => d.remote_work === 'Yes' && d.treatment === 'Yes').length },
        { type: 'Remote', treatmentNo: data.filter(d => d.remote_work === 'Yes' && d.treatment === 'No').length },
        { type: 'Office', treatmentYes: data.filter(d => d.remote_work === 'No' && d.treatment === 'Yes').length },
        { type: 'Office', treatmentNo: data.filter(d => d.remote_work === 'No' && d.treatment === 'No').length }
    ];
    
    // Group the data for stacked bar chart
    const groupedData = d3.groups(remoteData, d => d.type)
        .map(([key, values]) => {
            const treatmentYes = values.find(v => v.treatmentYes)?.treatmentYes || 0;
            const treatmentNo = values.find(v => v.treatmentNo)?.treatmentNo || 0;
            const total = treatmentYes + treatmentNo;
            
            return {
                type: key,
                treatmentYes,
                treatmentNo,
                total,
                treatmentYesPercent: total > 0 ? (treatmentYes / total * 100) : 0,
                treatmentNoPercent: total > 0 ? (treatmentNo / total * 100) : 0
            };
        });
    
    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = document.getElementById('remote-chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('remote-chart').clientHeight - margin.top - margin.bottom;
    
    // Create chart
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.type))
        .range([0, width])
        .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([height, 0]);
    
    // Add bars for treatment yes
    chart.selectAll('.treatment-yes')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-yes')
        .attr('x', d => x(d.type))
        .attr('y', d => y(d.treatmentYesPercent))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.treatmentYesPercent))
        .attr('fill', '#4a6fa5')
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.type} workers: ${d.treatmentYesPercent.toFixed(1)}% sought treatment (${d.treatmentYes} people)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add bars for treatment no
    chart.selectAll('.treatment-no')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'treatment-no')
        .attr('x', d => x(d.type))
        .attr('y', d => y(0))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.treatmentNoPercent))
        .attr('fill', '#ff7e5f')
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.type} workers: ${d.treatmentNoPercent.toFixed(1)}% didn't seek treatment (${d.treatmentNo} people)`);
        })
        .on('mouseout', hideTooltip);
    
    // Add X axis
    chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    // Add Y axis
    chart.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width / 2 - 50},${height + margin.top + 20})`);
    
    legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#4a6fa5');
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text('Sought Treatment');
    
    legend.append('rect')
        .attr('x', 150)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#ff7e5f');
    
    legend.append('text')
        .attr('x', 170)
        .attr('y', 12)
        .text('No Treatment');
}

// Tooltip functions
function showTooltip(event, content) {
    const tooltip = d3.select('.tooltip');
    if (tooltip.empty()) {
        d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }
    
    d3.select('.tooltip')
        .html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 20) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

function hideTooltip() {
    d3.select('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0);
}