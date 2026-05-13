namespace MemoryApp.Api.Dtos;

public class UploadPhotoDto
{
    public int OwnerId { get; set; }

    public string? Note { get; set; }

    public List<int> FolderIds { get; set; } = new();

    public IFormFile File { get; set; } = null!;
}