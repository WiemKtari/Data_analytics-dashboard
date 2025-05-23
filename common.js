// common.js
document.addEventListener('DOMContentLoaded', () => {
  const applyFiltersBtn = document.getElementById('apply-filters');
  const ageInput = document.getElementById('age');
  const ageValue = document.getElementById('age-value');
  const countrySelect = document.getElementById('country');
  const toast = document.getElementById('toast');

  let surveyData = [];

  // Update age value display when slider changes
  ageInput.addEventListener('input', () => {
    ageValue.textContent = ageInput.value;
  });

  // Load CSV data
  d3.csv("final_integrated (1).csv").then(data => {
    surveyData = data.map(row => {
      // Convert age to number safely
      row.age = row.age ? +row.age : null;

      // Clean gender text
      if (row.gender) {
        const g = row.gender.toLowerCase();
        if (g.includes('female')) row.gender = 'Female';
        else if (g.includes('male')) row.gender = 'Male';
        else if (g.includes('non-binary') || g.includes('nonbinary')) row.gender = 'Non-binary';
        else if (g.includes('trans')) row.gender = 'Transgender';
        else row.gender = 'Other';
      } else {
        row.gender = 'Other';
      }

      return row;
    });

    populateCountryOptions(surveyData);

    // You can call other functions to initialize charts here

  }).catch(error => {
    console.error("Error loading the CSV file:", error);
    alert("Failed to load data file. Check console for details.");
  });

  // Populate country dropdown based on data
  function populateCountryOptions(data) {
    // Get unique countries
    const countries = Array.from(new Set(data.map(d => d.country).filter(c => c && c.trim() !== '')));
    countries.sort();

    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  }

  // Handle filter button click
  applyFiltersBtn.addEventListener('click', () => {
    applyFilters();
  });

  function applyFilters() {
    // Example: filter data based on filters and update summary
    const genderFilter = document.getElementById('gender').value;
    const ageFilter = +document.getElementById('age').value;
    const countryFilter = document.getElementById('country').value;
    const remoteFilter = document.getElementById('remote').value;
    const techFilter = document.getElementById('tech').value;

    // Filter data
    let filtered = surveyData.filter(d => {
      if (genderFilter !== 'All' && d.gender !== genderFilter) return false;
      if (countryFilter !== 'All' && d.country !== countryFilter) return false;
      if (remoteFilter !== 'All' && d.remote_work !== remoteFilter) return false;
      if (techFilter !== 'All' && d.tech_company !== techFilter) return false;
      if (d.age === null || d.age > ageFilter) return false; // age less or equal to slider
      return true;
    });

    // Calculate Treatment Rate (example)
    let treatmentCount = filtered.filter(d => d.treatment && d.treatment.toLowerCase() === 'yes').length;
    let treatmentRate = filtered.length ? (treatmentCount / filtered.length) * 100 : 0;

    // Calculate Work Interference Rate (example: assuming work_interfere 'Often' means interference)
    let interferenceCount = filtered.filter(d => d.work_interfere && d.work_interfere.toLowerCase() === 'often').length;
    let interferenceRate = filtered.length ? (interferenceCount / filtered.length) * 100 : 0;

    document.getElementById('treatment-rate').textContent = treatmentRate.toFixed(1) + '%';
    document.getElementById('interference-rate').textContent = interferenceRate.toFixed(1) + '%';

    // Show toast notification
    showToast("Filters applied successfully!");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
});
