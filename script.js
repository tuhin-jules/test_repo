document.addEventListener('DOMContentLoaded', () => {
    const waterSlider = document.getElementById('water-slider');
    const waterElement = document.getElementById('water');
    const waterStreamElement = document.getElementById('water-stream'); // Get reference to #water-stream

    let previousWaterLevel = parseFloat(waterSlider.value); // Initialize previousWaterLevel

    waterSlider.addEventListener('input', () => {
        const currentWaterLevel = parseFloat(waterSlider.value); // Get current water level

        // Update the #water element's height
        waterElement.style.height = `${currentWaterLevel}%`;

        // Implement flow animation if water level increases
        if (currentWaterLevel > previousWaterLevel) {
            if (waterStreamElement) {
                // Make #water-stream visible and set initial height
                waterStreamElement.style.display = 'block';
                waterStreamElement.style.height = '0px';

                // Force a reflow to ensure the transition starts
                void waterStreamElement.offsetWidth; 

                // Animate the #water-stream's height
                // The stream starts at top: 100px.
                // The bucket-container top is at 170px from app top.
                // So, stream height should be 70px to reach the top of bucket-container.
                waterStreamElement.style.height = '70px'; 

                // After a short delay, hide the #water-stream again and reset its height
                setTimeout(() => {
                    waterStreamElement.style.display = 'none';
                    waterStreamElement.style.height = '0px';
                }, 350); // Duration slightly longer than CSS transition (0.3s = 300ms)
            }
        }

        previousWaterLevel = currentWaterLevel; // Update previousWaterLevel
    });

    // Initialize water level on load based on slider's default value
    waterElement.style.height = `${previousWaterLevel}%`;
});
