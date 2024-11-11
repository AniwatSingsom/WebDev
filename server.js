const fileInput = document.getElementById('fileInput');
const progressBar = document.querySelector('.progress-fill');
const progressContainer = document.querySelector('.upload-progress');
const progressText = document.querySelector('.progress-text');
const gallery = document.querySelector('.gallery');

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    progressContainer.style.display = 'block';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            console.error('Invalid file type:', file.type);
            continue;
        }

        const progress = ((i + 1) / files.length) * 100;
        progressText.textContent = `Uploading ${i + 1} of ${files.length}...`;
        progressBar.style.width = `${progress}%`;

        try {
            // Create FormData for the file
            const formData = new FormData();
            formData.append('file', file);

            // Upload to Netlify function
            const response = await fetch('/.netlify/functions/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            addImageToGallery(data.url, file.name);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Failed to upload ${file.name}: ${error.message}`);
        }
    }

    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        fileInput.value = '';
    }, 1000);
});