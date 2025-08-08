document.addEventListener('DOMContentLoaded', () => {
    const biomarkerForm = document.getElementById('biomarker-form');
    const biomarkerList = document.getElementById('biomarker-list');
    const markerNameSelect = document.getElementById('marker-name');
    const markerValueInput = document.getElementById('marker-value');
    const markerDateInput = document.getElementById('marker-date');
    const ctx = document.getElementById('biomarker-chart').getContext('2d');

    // Reference ranges for biomarkers (example values)
    const referenceRanges = {
        'Hemoglobin': { low: 13.5, high: 17.5, unit: 'g/dL' },
        'Cholesterol': { low: 125, high: 200, unit: 'mg/dL' },
        'Glucose': { low: 70, high: 99, unit: 'mg/dL' },
        'Vitamin D': { low: 20, high: 50, unit: 'ng/mL' },
        'Iron': { low: 60, high: 170, unit: 'mcg/dL' },
    };

    let biomarkers = [];
    let biomarkerChart;

    function getStatus(name, value) {
        const range = referenceRanges[name];
        if (!range) return 'normal'; // Default if no range is defined
        if (value < range.low) return 'low';
        if (value > range.high) return 'high';
        return 'normal';
    }

    function displayBiomarkers() {
        biomarkerList.innerHTML = '';
        const sortedBiomarkers = [...biomarkers].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedBiomarkers.forEach(marker => {
            const item = document.createElement('div');
            item.className = 'biomarker-item';
            const status = getStatus(marker.name, marker.value);
            item.innerHTML = `
                <span>
                    <strong>${marker.name}</strong>:
                    ${marker.value} ${referenceRanges[marker.name]?.unit || ''}
                    on ${marker.date}
                </span>
                <span class="status ${status}">${status}</span>
            `;
            biomarkerList.appendChild(item);
        });
    }

    function updateChart() {
        const selectedMarker = markerNameSelect.value || (biomarkers.length > 0 ? biomarkers[0].name : 'Hemoglobin');

        const filteredData = biomarkers
            .filter(marker => marker.name === selectedMarker)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = filteredData.map(marker => marker.date);
        const data = filteredData.map(marker => marker.value);
        const range = referenceRanges[selectedMarker];

        if (biomarkerChart) {
            biomarkerChart.destroy();
        }

        biomarkerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${selectedMarker} (${range?.unit || ''})`,
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false,
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    },
                    annotation: {
                        annotations: {
                            highRange: {
                                type: 'box',
                                yMin: range?.high,
                                yMax: Math.max(...data, range?.high || 0) * 1.1,
                                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                borderColor: 'transparent'
                            },
                            lowRange: {
                                type: 'box',
                                yMin: 0,
                                yMax: range?.low,
                                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                                borderColor: 'transparent'
                            },
                             normalRange: {
                                type: 'box',
                                yMin: range?.low,
                                yMax: range?.high,
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                borderColor: 'transparent'
                            }
                        }
                    }
                }
            }
        });
    }

    biomarkerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = markerNameSelect.value;
        const value = parseFloat(markerValueInput.value);
        const date = markerDateInput.value;

        if (name && !isNaN(value) && date) {
            biomarkers.push({ name, value, date });
            displayBiomarkers();
            updateChart();
            biomarkerForm.reset();
            // Re-select the last used marker name for convenience
            markerNameSelect.value = name;
            markerValueInput.focus();
        }
    });

    markerNameSelect.addEventListener('change', updateChart);

    // Load data from localStorage
    const savedBiomarkers = localStorage.getItem('biomarkers');
    if (savedBiomarkers) {
        biomarkers = JSON.parse(savedBiomarkers);
    }

    // Add a function to save to localStorage
    function saveData() {
        localStorage.setItem('biomarkers', JSON.stringify(biomarkers));
    }

    // Overwrite the original addBiomarker event listener to include saving
    biomarkerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = markerNameSelect.value;
        const value = parseFloat(markerValueInput.value);
        const date = markerDateInput.value;

        if (name && !isNaN(value) && date) {
            biomarkers.push({ name, value, date });
            saveData(); // Save data
            displayBiomarkers();
            updateChart();
            biomarkerForm.reset();
            markerNameSelect.value = name;
            markerValueInput.focus();
        }
    });


    // Initial render
    displayBiomarkers();
    updateChart();
});
