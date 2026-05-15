using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Dtos;
using MemoryApp.Api.Models;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoldersController : ControllerBase
{
    private readonly AppDbContext _context;

    public FoldersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateFolder(CreateFolderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Название папки не может быть пустым.");
        }

        var ownerExists = await _context.Users.AnyAsync(u => u.Id == dto.OwnerId);

        if (!ownerExists)
        {
            return BadRequest("Пользователь не найден.");
        }

        if (dto.ParentFolderId != null)
        {
            var parentExists = await _context.Folders
                .AnyAsync(f => f.Id == dto.ParentFolderId);

            if (!parentExists)
            {
                return BadRequest("Родительская папка не найдена.");
            }
        }

        var folder = new Folder
        {
            Name = dto.Name,
            OwnerId = dto.OwnerId,
            ParentFolderId = dto.ParentFolderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Folders.Add(folder);
        await _context.SaveChangesAsync();

        return Ok(folder);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserFolders(int userId)
    {
        var folders = await _context.Folders
            .Where(f => f.OwnerId == userId)
            .OrderByDescending(f => f.UpdatedAt)
            .Select(f => new
            {
                f.Id,
                f.Name,
                f.OwnerId,
                f.ParentFolderId,
                f.CreatedAt,
                f.UpdatedAt
            })
            .ToListAsync();

        return Ok(folders);
    }

    [HttpGet("{folderId}")]
    public async Task<IActionResult> GetFolder(int folderId)
    {
        var folder = await _context.Folders
            .Where(f => f.Id == folderId)
            .Select(f => new
            {
                f.Id,
                f.Name,
                f.OwnerId,
                f.ParentFolderId,
                f.CreatedAt,
                f.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (folder == null)
        {
            return NotFound("Папка не найдена.");
        }

        return Ok(folder);
    }

    [HttpGet("content/{folderId}")]
    public async Task<IActionResult> GetFolderContent(
        int folderId,
        [FromQuery] int userId)
    {
        var folder = await _context.Folders
            .FirstOrDefaultAsync(f => f.Id == folderId);

        if (folder == null)
        {
            return NotFound("Папка не найдена.");
        }

        var hasAccess =
            folder.OwnerId == userId ||
            await _context.FolderAccesses.AnyAsync(a =>
                a.FolderId == folderId &&
                a.UserId == userId);

        if (!hasAccess)
        {
            return StatusCode(403, "Нет доступа.");
        }

        var childFolders = await _context.Folders
            .Where(f => f.ParentFolderId == folderId)
            .OrderByDescending(f => f.UpdatedAt)
            .Select(f => new
            {
                Type = "folder",
                f.Id,
                f.Name,
                f.CreatedAt,
                f.UpdatedAt
            })
            .ToListAsync();

        var photos = await _context.PhotoFolders
            .Where(pf => pf.FolderId == folderId)
            .Include(pf => pf.Photo)
            .ThenInclude(p => p.Owner)
            .OrderByDescending(pf => pf.Photo.UploadedAt)
            .Select(pf => new
            {
                Type = "photo",
                pf.Photo.Id,
                pf.Photo.FileUrl,
                pf.Photo.ThumbnailUrl,
                pf.Photo.Note,
                pf.Photo.UploadedAt,
                OwnerName = pf.Photo.Owner.Username
            })
            .ToListAsync();

        return Ok(new
        {
            FolderId = folder.Id,
            FolderName = folder.Name,
            ChildFolders = childFolders,
            Photos = photos
        });
    }

    [HttpPut("{folderId}")]
    public async Task<IActionResult> RenameFolder(int folderId, UpdateFolderDto dto)
    {
        var folder = await _context.Folders.FindAsync(folderId);

        if (folder == null)
        {
            return NotFound("Папка не найдена.");
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Название папки не может быть пустым.");
        }

        folder.Name = dto.Name;
        folder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(folder);
    }

    [HttpDelete("{folderId}")]
    public async Task<IActionResult> DeleteFolder(int folderId)
    {
        var folder = await _context.Folders.FindAsync(folderId);

        if (folder == null)
        {
            return NotFound("Папка не найдена.");
        }

        _context.Folders.Remove(folder);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Папка удалена"
        });
    }

    [HttpGet("home/{userId}")]
    public async Task<IActionResult> GetHomeFolders(int userId)
    {
        var ownFolders = await _context.Folders
            .Where(f => f.OwnerId == userId)
            .OrderByDescending(f => f.UpdatedAt)
            .Select(f => new
            {
                f.Id,
                f.Name,
                PreviewPhotos = new List<string>()
            })
            .ToListAsync();

        var sharedFolders = await _context.FolderAccesses
            .Where(a => a.UserId == userId)
            .Select(a => a.Folder)
            .Distinct()
            .OrderByDescending(f => f.UpdatedAt)
            .Select(f => new
            {
                f.Id,
                f.Name,
                PreviewPhotos = new List<string>()
            })
            .ToListAsync();

        return Ok(new
        {
            ownFolders,
            sharedFolders
        });
    }
}