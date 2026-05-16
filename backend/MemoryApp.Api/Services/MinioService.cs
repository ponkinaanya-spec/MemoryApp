using Amazon.S3;
using Amazon.S3.Model;

namespace MemoryApp.Api.Services;

public class MinioService
{
    private readonly AmazonS3Client _client;

    private const string BucketName = "photos";

    public MinioService()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = "http://127.0.0.1:9000",
            ForcePathStyle = true,
            UseHttp = true,
        };

        _client = new AmazonS3Client(
            "admin",
            "password123",
            config
        );
    }

    public async Task<string> UploadFileAsync(
        IFormFile file
    )
    {
        var extension =
            Path.GetExtension(file.FileName);

        var fileName =
            $"{Guid.NewGuid()}{extension}";

        await using var stream =
            file.OpenReadStream();

        var request = new PutObjectRequest
        {
            BucketName = BucketName,
            Key = fileName,
            InputStream = stream,
            ContentType = file.ContentType
        };

        await _client.PutObjectAsync(request);

        return
            $"http://127.0.0.1:9000/{BucketName}/{fileName}";
    }
}