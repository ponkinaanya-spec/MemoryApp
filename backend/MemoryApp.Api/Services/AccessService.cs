using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;

namespace MemoryApp.Api.Services;

public class AccessService
{
    private readonly AppDbContext _context;

    public AccessService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GetFolderAccessLevel(int userId, int folderId)
    {
        var folder = await _context.Folders
            .FirstOrDefaultAsync(f => f.Id == folderId);

        if (folder == null)
        {
            return "none";
        }

        if (folder.OwnerId == userId)
        {
            return "owner";
        }

        var directAccess = await _context.FolderAccesses
            .FirstOrDefaultAsync(a =>
                a.FolderId == folderId &&
                a.UserId == userId);

        if (directAccess != null)
        {
            return directAccess.AccessType;
        }

        if (folder.ParentFolderId != null)
        {
            return await GetFolderAccessLevel(userId, folder.ParentFolderId.Value);
        }

        return "none";
    }

    public async Task<bool> CanViewFolder(int userId, int folderId)
    {
        var access = await GetFolderAccessLevel(userId, folderId);
        return access == "owner" || access == "editor" || access == "viewer";
    }

    public async Task<bool> CanEditFolder(int userId, int folderId)
    {
        var access = await GetFolderAccessLevel(userId, folderId);
        return access == "owner" || access == "editor";
    }

    public async Task<bool> IsOwner(int userId, int folderId)
    {
        var access = await GetFolderAccessLevel(userId, folderId);
        return access == "owner";
    }
}