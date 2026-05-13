namespace MemoryApp.Api.Dtos;

public class CreateFolderDto
{
    public string Name { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public int? ParentFolderId { get; set; }
}