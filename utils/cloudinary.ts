import crypto from 'crypto';

// Default values
const CLOUD_NAME = 'da2qwsrbv';
const API_KEY = '712369776222516';
const API_SECRET = '3uw0opJfkdYDp-XQsXclVIcbbKQ';

function generateSignature(timestamp: number): string {
  const str = `timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}


export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // Refresh settings before upload to ensure we have the latest
  
  // Check if we have the required Cloudinary credentials
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary credentials not found or invalid. Please check your settings.');
  }
  
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve(data.secure_url);
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        reject(error);
      });
  });
};