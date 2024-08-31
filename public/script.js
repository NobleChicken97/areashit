const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const showImagesButton = document.getElementById('show-images');
const imageContainer = document.getElementById('image-container');
const areaDisplay = document.getElementById('area-disp');
let capturedImages = [];
let locations = []; // Store location data

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Use the back camera
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing camera: ", err);
        alert("Unable to access the camera. Please check your permissions.");
    });

captureButton.addEventListener('click', async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    
    try {
        const locationData = await getLocation();
        locations.push([locationData.longitude, locationData.latitude]);
        console.log('Location data:', locationData);
        
        const resizedImageDataUrl = await resizeImage(imageDataUrl, 800, 600);
        capturedImages.push(resizedImageDataUrl);

        console.log('Locations array:', locations);

        if (locations.length >= 3) { // Ensure there are enough points to form a polygon
            // Close the loop by pushing the first point to the end
            const closedLoop = [...locations, locations[0]];

            const polygon = turf.polygon([closedLoop]); // Create a polygon from location data
            const area = turf.area(polygon); // Calculate the area

            if(area === 0) {
                console.log('Area calculation returned zero. Possible issue with the points or Turf.js.');
            } else {
                areaDisplay.innerHTML = 'Area is: ' + area + ' square meters';
            }
        
            console.log('Polygon:', polygon);
            console.log('Area in square meters:', area);

            const response = await fetch('/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    image: resizedImageDataUrl,
                    location: locationData,
                    area: area // Send calculated area
                })
            });

            const data = await response.json();
            console.log('Image uploaded successfully:', data);
        } else {
            console.log('Not enough points to form a polygon.');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
});

function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, error => {
                reject('Error getting location: ' + error.message);
            });
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
}

function displayImages() {
    imageContainer.innerHTML = '';
    capturedImages.forEach((imgSrc, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.alt = `Captured image ${index + 1}`;
        imgElement.style.width = '200px';
        imgElement.style.margin = '10px';
        imageContainer.appendChild(imgElement);
    });
}

showImagesButton.addEventListener('click', () => {
    console.log('Showing images...');
    displayImages();
});

function resizeImage(dataURL, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = dataURL;
    });
}
