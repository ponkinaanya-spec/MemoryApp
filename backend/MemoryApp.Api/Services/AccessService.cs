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

    public async Task<bool> CanViewFolder(int userId, int folderId)
    {
        var folder = await _context.Folders
            .FirstOrDefaultAsync(f => f.Id == folderId);

        if (folder == null)
        {
            return false;
        }

        if (folder.OwnerId == userId)
        {
            return true;
        }

        return await _context.FolderAccesses.AnyAsync(a =>
            a.FolderId == folderId &&
            a.UserId == userId);
    }

    public async Task<bool> CanEditFolder(int userId, int folderId)
    {
        var folder = await _context.Folders
            .FirstOrDefaultAsync(f => f.Id == folderId);

        if (folder == null)
        {
            return false;
        }

        if (folder.OwnerId == userId)
        {
            return true;
        }

        return await _context.FolderAccesses.AnyAsync(a =>
            a.FolderId == folderId &&
            a.UserId == userId &&
            a.AccessType == "editor");
    }
}