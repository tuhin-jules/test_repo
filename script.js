document.addEventListener('DOMContentLoaded', () => {
    const waterSlider = document.getElementById('water-slider');
    const waterElement = document.getElementById('water'); // Reference already exists
    const waterStreamElement = document.getElementById('water-stream');
    const pipeElement = document.getElementById('pipe');
    const bucketElement = document.getElementById('bucket');
    const bucketContainerElement = document.getElementById('bucket-container');
    const splashElement = document.getElementById('splash'); 

    let previousWaterLevel = parseFloat(waterSlider.value);
    let waterSurfaceY = 0; 
    let rippleTimeoutId = null; // To manage ripple timeout

    // Initialize water level on load
    waterElement.style.height = `${previousWaterLevel}%`;

    waterSlider.addEventListener('input', () => {
        const currentWaterLevel = parseFloat(waterSlider.value);
        waterElement.style.height = `${currentWaterLevel}%`;

        // --- Ripple Effect ---
        // Clear existing timeout if any
        if (rippleTimeoutId) {
            clearTimeout(rippleTimeoutId);
        }
        waterElement.classList.remove('ripple-effect');
        void waterElement.offsetWidth; // Force reflow
        waterElement.classList.add('ripple-effect');

        rippleTimeoutId = setTimeout(() => {
            waterElement.classList.remove('ripple-effect');
            rippleTimeoutId = null; // Reset timeoutId
        }, 500); // Adjusted: Match animation duration from CSS (0.5s)


        // --- Stream and Splash (only if water increases) ---
        if (currentWaterLevel > previousWaterLevel) {
            if (waterStreamElement && pipeElement && bucketElement && bucketContainerElement && splashElement) {
                
                const pipeOutletY = waterStreamElement.offsetTop;
                const bucketRimY = bucketContainerElement.offsetTop + bucketElement.offsetTop;
                const bucketHeight = bucketElement.offsetHeight;
                const waterLevelRatio = currentWaterLevel / 100;
                const waterHeightInBucket = waterLevelRatio * bucketHeight;
                
                waterSurfaceY = bucketRimY + (bucketHeight - waterHeightInBucket); 
                waterSurfaceY = Math.min(waterSurfaceY, bucketRimY + bucketHeight);

                let desiredStreamHeight = waterSurfaceY - pipeOutletY;
                const maxStreamHeightToBucketBottom = (bucketRimY + bucketHeight) - pipeOutletY;
                desiredStreamHeight = Math.min(desiredStreamHeight, maxStreamHeightToBucketBottom);
                const actualStreamHeight = Math.max(0, desiredStreamHeight);

                // Water Stream Animation
                waterStreamElement.style.display = 'block';
                waterStreamElement.style.height = '0px';
                void waterStreamElement.offsetWidth;
                waterStreamElement.style.height = `${actualStreamHeight}px`;

                setTimeout(() => {
                    waterStreamElement.style.display = 'none';
                    waterStreamElement.style.height = '0px';
                }, 350);

                // Splash Effect
                const streamLeft = waterStreamElement.offsetLeft;
                const streamWidth = waterStreamElement.offsetWidth; 
                const splashCssWidth = 25; // Adjusted: New splash width
                const splashCssHeight = 12; // Adjusted: New splash height

                const splashX = streamLeft + (streamWidth / 2) - (splashCssWidth / 2);
                const splashY = waterSurfaceY - (splashCssHeight / 2) - 5; 

                splashElement.style.left = `${splashX}px`;
                splashElement.style.top = `${splashY}px`;
                
                splashElement.style.animation = 'none'; 
                void splashElement.offsetWidth; 
                splashElement.style.display = 'block'; 
                splashElement.style.animation = 'splash-animation 0.3s ease-out forwards'; 

                setTimeout(() => {
                    splashElement.style.display = 'none';
                    splashElement.style.animation = 'none'; 
                }, 300); 
            }
        }
        previousWaterLevel = currentWaterLevel;
    });
});
