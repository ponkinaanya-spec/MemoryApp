namespace MemoryApp.Api.Models;

public class PhotoFolder
{
    public int PhotoId { get; set; }
    public Photo Photo { get; set; } = null!;

    public int FolderId { get; set; }
    public Folder Folder { get; set; } = null!;
}