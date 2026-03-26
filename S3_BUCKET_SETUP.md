# S3 Bucket Configuration for Public Access

Your S3 bucket has ACLs disabled (recommended modern security practice). To make uploaded images publicly accessible, you need to configure a bucket policy instead.

## Step 1: Go to AWS S3 Console

1. Navigate to https://s3.console.aws.amazon.com/
2. Find your bucket (check `AWS_S3_BUCKET` environment variable in Railway)
3. Click on the bucket name

## Step 2: Configure Bucket Policy

1. Go to the **Permissions** tab
2. Scroll down to **Bucket policy**
3. Click **Edit**
4. Paste the following policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click **Save changes**

## Step 3: Verify Public Access Settings

1. In the **Permissions** tab, find **Block public access (bucket settings)**
2. Click **Edit**
3. Ensure these settings:
   - ❌ Block all public access: **OFF**
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs): **OFF**
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs): **OFF**
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies: **ON** (recommended)
   - ✅ Block public and cross-account access to buckets and objects through any public bucket or access point policies: **ON** (recommended)

4. Click **Save changes**

## Step 4: Verify Configuration

After applying the bucket policy, test by:

1. Upload a test image to your bucket
2. Try accessing it via: `https://YOUR-BUCKET-NAME.s3.YOUR-REGION.amazonaws.com/path/to/image.png`
3. If you can see the image in your browser, the configuration is correct

## Alternative: Use CloudFront (Recommended for Production)

For better performance and security, consider using CloudFront CDN:

1. Create a CloudFront distribution pointing to your S3 bucket
2. Use CloudFront URLs instead of direct S3 URLs
3. Keep S3 bucket private and use Origin Access Identity (OAI)

This provides:
- Faster global content delivery
- HTTPS by default
- DDoS protection
- Better security (bucket stays private)

## Current Configuration

The application is configured to use direct S3 URLs:
- Format: `https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{storageKey}`
- Environment variables needed:
  - `AWS_S3_BUCKET`: Your bucket name
  - `AWS_REGION`: Your bucket region (e.g., `us-east-1`)
  - `AWS_ACCESS_KEY_ID`: Your AWS access key
  - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

## Troubleshooting

**Images still not loading?**
1. Check browser console for CORS errors
2. Verify bucket policy is saved correctly
3. Ensure `AWS_S3_BUCKET` and `AWS_REGION` environment variables are correct in Railway
4. Try accessing the S3 URL directly in a new browser tab
5. Check that the objects were actually uploaded (go to S3 console and verify files exist)

**CORS Issues?**
Add CORS configuration in S3 bucket:
1. Go to **Permissions** > **Cross-origin resource sharing (CORS)**
2. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
