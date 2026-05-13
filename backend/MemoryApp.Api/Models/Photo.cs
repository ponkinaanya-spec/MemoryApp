namespace MemoryApp.Api.Models;

public class Photo
{
    public int Id { get; set; }

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public string FileUrl { get; set; } = string.Empty;

    public string? ThumbnailUrl { get; set; }

    public string? Note { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}