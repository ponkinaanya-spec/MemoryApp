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
}