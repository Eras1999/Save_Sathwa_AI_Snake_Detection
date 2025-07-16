document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const detectButton = document.getElementById('detectButton');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const resultsDiv = document.getElementById('results');
    const detectionOutput = document.getElementById('detectionOutput');
    const noObjectDetectedDiv = document.getElementById('noObjectDetected');

    // Replace with your actual Roboflow Model Endpoint and API Key
    const ROBOTFLOW_MODEL_ENDPOINT = "snakeid/1"; // e.g., "my-snake-project/1"
    const ROBOTFLOW_API_KEY = "U6IlOYpLle3LI8vyvTZt"; // Get this from Roboflow Deploy tab

    let uploadedImageBase64 = null;

    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                uploadedImageBase64 = e.target.result.split(',')[1]; // Get base64 string after "data:image/jpeg;base64,"
                imagePreviewContainer.classList.remove('hidden');
                resultsDiv.classList.add('hidden');
                noObjectDetectedDiv.classList.add('hidden');
                detectionOutput.innerHTML = ''; // Clear previous results
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.classList.add('hidden');
            uploadedImageBase64 = null;
        }
    });

    detectButton.addEventListener('click', async () => {
        if (!uploadedImageBase64) {
            alert('Please upload an image first!');
            return;
        }

        detectionOutput.innerHTML = '<p>Detecting...</p>';
        resultsDiv.classList.remove('hidden');
        noObjectDetectedDiv.classList.add('hidden');

        try {
            const response = await fetch(
                `https://detect.roboflow.com/${ROBOTFLOW_MODEL_ENDPOINT}?api_key=${ROBOTFLOW_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: uploadedImageBase64,
                }
            );

            const data = await response.json();

            if (data && data.predictions && data.predictions.length > 0) {
                detectionOutput.innerHTML = ''; // Clear "Detecting..."
                data.predictions.forEach(prediction => {
                    const confidence = (prediction.confidence * 100).toFixed(2);
                    detectionOutput.innerHTML += `
                        <p>Species: <strong>${prediction.class}</strong></p>
                        <p>Confidence: ${confidence}%</p>
                        <hr>
                    `;
                    // You could also draw bounding boxes on the image preview here if you want more advanced visualization
                });
            } else {
                resultsDiv.classList.add('hidden');
                noObjectDetectedDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error during detection:', error);
            detectionOutput.innerHTML = '<p style="color: red;">Error detecting snake. Please try again.</p>';
        }
    });
});