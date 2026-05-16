using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace MemoryApp.Api.Services;

public class MinioService
{
    private readonly AmazonS3Client _s3Client;
    private const string BucketName = "photos";

    public MinioService()
    {
        var credentials = new BasicAWSCredentials(
            "admin",
            "password123"
        );

        var config = new AmazonS3Config
        {
            ServiceURL = "http://127.0.0.1:9000",
            ForcePathStyle = true,
            UseHttp = true,
            AuthenticationRegion = "us-east-1"
        };

        _s3Client = new AmazonS3Client(credentials, config);
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        await EnsureBucketExists();

        var extension = Path.GetExtension(file.FileName);
        var objectName = $"{Guid.NewGuid()}{extension}";

        await using var stream = file.OpenReadStream();

        var request = new PutObjectRequest
        {
            BucketName = BucketName,
            Key = objectName,
            InputStream = stream,
            ContentType = file.ContentType ?? "image/jpeg"
        };

        await _s3Client.PutObjectAsync(request);

        return $"/api/Photos/file/{objectName}";
    }

    public async Task<Stream> GetFileAsync(string objectName)
    {
        var response = await _s3Client.GetObjectAsync(
            BucketName,
            objectName
        );

        var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        return memoryStream;
    }

    private async Task EnsureBucketExists()
    {
        var buckets = await _s3Client.ListBucketsAsync();

        var exists = buckets.Buckets.Any(
            bucket => bucket.BucketName == BucketName
        );

        if (!exists)
        {
            await _s3Client.PutBucketAsync(BucketName);
        }
    }
}