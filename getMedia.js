// netlify/functions/getMedia.js
exports.handler = async (event) => {
    try {
      // List objects in S3 bucket
      const data = await s3.listObjectsV2({
        Bucket: BUCKET_NAME,
        MaxKeys: 100
      }).promise();
  
      const files = data.Contents.map(item => ({
        key: item.Key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
        lastModified: item.LastModified,
        size: item.Size
      }));
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ files })
      };
    } catch (error) {
      console.error('Error fetching media:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch media' })
      };
    }
  };