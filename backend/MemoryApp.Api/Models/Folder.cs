namespace MemoryApp.Api.Models;

public class Folder
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public int? ParentFolderId { get; set; }
    public Folder? ParentFolder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsPinned { get; set; } = false;
}