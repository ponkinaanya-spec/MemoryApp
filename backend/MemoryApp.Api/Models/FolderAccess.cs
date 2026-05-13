namespace MemoryApp.Api.Models;

public class FolderAccess
{
    public int Id { get; set; }

    public int FolderId { get; set; }
    public Folder Folder { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string AccessType { get; set; } = "viewer";
}