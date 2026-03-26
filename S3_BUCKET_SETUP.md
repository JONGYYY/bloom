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

## Step 5: Configure CORS (REQUIRED for browser access)

Even with the bucket policy, browsers need CORS configuration to load images:

1. In the **Permissions** tab, scroll to **Cross-origin resource sharing (CORS)**
2. Click **Edit**
3. Paste this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Click **Save changes**

**Important**: Without CORS, images will fail to load in the browser even if the bucket policy is correct!

## Troubleshooting

### Images still not loading?

**Step 1: Check Browser Console**
Open your browser's developer tools (F12) and look for errors:
- **CORS error**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
  → Fix: Add CORS configuration (see Step 5 above)
- **403 Forbidden**: "Access Denied"
  → Fix: Verify bucket policy is applied correctly
- **404 Not Found**: "The specified key does not exist"
  → Fix: Check that files were actually uploaded to S3

**Step 2: Test Direct S3 Access**
1. Copy an S3 URL from the Railway logs (look for `[Downloader] Public URL:`)
2. Paste it directly in a new browser tab
3. If the image loads → CORS issue. If it doesn't load → bucket policy issue.

**Step 3: Verify Environment Variables**
In Railway, check these environment variables are set correctly:
- `AWS_S3_BUCKET`: Your bucket name (e.g., `bloom-assets`)
- `AWS_REGION`: Your bucket region (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

**Step 4: Check S3 Console**
1. Go to your S3 bucket in AWS console
2. Navigate to the `studios/` folder
3. Verify that image files exist
4. Click on a file and try to open the "Object URL" - if it works, your bucket is configured correctly

**Step 5: Verify Block Public Access Settings**
Make sure these are **OFF** (unchecked):
- ☐ Block all public access
- ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
- ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
- ☐ Block public access to buckets and objects granted through new public bucket or access point policies
- ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies

All five should be **unchecked** for public access to work.
