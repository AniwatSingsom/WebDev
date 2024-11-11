// netlify/functions/upload.js
const AWS = require('aws-sdk');
const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const result = await multipart.parse(event);
    const file = result.files[0];

    // Validate file
    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file provided' })
      };
    }

    if (!ALLOWED_TYPES.includes(file.contentType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid file type' })
      };
    }

    if (file.content.length > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'File too large' })
      };
    }

    // Generate unique filename
    const fileId = uuidv4();
    const extension = file.filename.split('.').pop();
    const key = `${fileId}.${extension}`;

    // Upload to S3
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.content,
      ContentType: file.contentType,
      ACL: 'public-read'
    }).promise();

    // Store metadata in DynamoDB (if needed)
    const fileData = {
      id: fileId,
      filename: file.filename,
      contentType: file.contentType,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      uploadDate: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(fileData)
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upload failed' })
    };
  }
};

