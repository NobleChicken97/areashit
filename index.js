import express from "express";
import bodyParser from "body-parser";

const port = 3000;
const app = express();

app.use(bodyParser.json({ limit: '50mb' })); // Increase payload limit
app.use(express.static("public"));

// Arrays to store image data and location data separately
let imageStore = [];
let locationStore = [];
let bufferStore = [];
let bufferAreaStore = [];

app.post('/upload-image', (req, res) => {
    // Log the entire request body to inspect what is being received
    // use next line only for debugging
    // console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const imageData = req.body.image;
    const locationData = req.body.location;
    const bufferData = req.body.buffer;
    const bufferArea = req.body.bufferArea;
    if (imageData) {
        console.log('Received image data:', imageData.substring(0, 50) + '...');
        imageStore.push(imageData);
    } else {
        console.log('No image data received');
    }

    if (locationData) {
        console.log('Received location data:', locationData);
        locationStore.push(locationData);
    } else {
        console.log('No location data received');
    }

    if (bufferData) {
        console.log('Received buffer data:', bufferData);
        bufferStore.push(bufferData);
    } else {
        console.log('No buffer data received');
    }

    if (bufferArea) {
        console.log('Received buffer area:', bufferArea);
        bufferAreaStore.push(bufferArea);
    } else {
        console.log('No buffer area data received');
    }

    res.json({ success: true, message: 'Image, location, and buffer data received and processed' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
