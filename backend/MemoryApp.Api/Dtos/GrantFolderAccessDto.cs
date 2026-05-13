namespace MemoryApp.Api.Dtos;

public class GrantFolderAccessDto
{
    public int FolderId { get; set; }

    public string UserEmailOrUsername { get; set; } = string.Empty;

    public string AccessType { get; set; } = "viewer";
}