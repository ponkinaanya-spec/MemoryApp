using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Dtos;
using MemoryApp.Api.Models;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FolderAccessController : ControllerBase
{
    private readonly AppDbContext _context;

    public FolderAccessController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("grant")]
    public async Task<IActionResult> GrantAccess(GrantFolderAccessDto dto)
    {
        if (dto.AccessType != "viewer" && dto.AccessType != "editor")
        {
            return BadRequest("Тип доступа должен быть viewer или editor.");
        }

        var folder = await _context.Folders
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == dto.FolderId);

        if (folder == null)
        {
            return NotFound("Папка не найдена.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Email == dto.UserEmailOrUsername ||
                u.Username == dto.UserEmailOrUsername);

        if (user == null)
        {
            return NotFound("Пользователь не найден.");
        }

        if (folder.OwnerId == user.Id)
        {
            return BadRequest("Владелец папки уже имеет полный доступ.");
        }

        var existingAccess = await _context.FolderAccesses
            .FirstOrDefaultAsync(a =>
                a.FolderId == dto.FolderId &&
                a.UserId == user.Id);

        if (existingAccess != null)
        {
            existingAccess.AccessType = dto.AccessType;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Доступ обновлен",
                existingAccess.Id,
                existingAccess.FolderId,
                existingAccess.UserId,
                user.Username,
                user.Email,
                existingAccess.AccessType
            });
        }

        var access = new FolderAccess
        {
            FolderId = dto.FolderId,
            UserId = user.Id,
            AccessType = dto.AccessType
        };

        _context.FolderAccesses.Add(access);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Доступ выдан",
            access.Id,
            access.FolderId,
            access.UserId,
            user.Username,
            user.Email,
            access.AccessType
        });
    }

    [HttpGet("folder/{folderId}")]
    public async Task<IActionResult> GetFolderAccesses(int folderId)
    {
        var accesses = await _context.FolderAccesses
            .Where(a => a.FolderId == folderId)
            .Include(a => a.User)
            .Select(a => new
            {
                a.Id,
                a.FolderId,
                a.UserId,
                a.User.Username,
                a.User.Email,
                a.AccessType
            })
            .ToListAsync();

        return Ok(accesses);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetSharedFoldersForUser(int userId)
    {
        var folders = await _context.FolderAccesses
            .Where(a => a.UserId == userId)
            .Include(a => a.Folder)
            .ThenInclude(f => f.Owner)
            .OrderByDescending(a => a.Folder.UpdatedAt)
            .Select(a => new
            {
                AccessId = a.Id,
                a.AccessType,
                FolderId = a.Folder.Id,
                FolderName = a.Folder.Name,
                a.Folder.ParentFolderId,
                OwnerId = a.Folder.Owner.Id,
                OwnerName = a.Folder.Owner.Username,
                OwnerEmail = a.Folder.Owner.Email,
                a.Folder.CreatedAt,
                a.Folder.UpdatedAt
            })
            .ToListAsync();

        return Ok(folders);
    }

    [HttpPut("{accessId}")]
    public async Task<IActionResult> UpdateAccess(int accessId, UpdateFolderAccessDto dto)
    {
        if (dto.AccessType != "viewer" && dto.AccessType != "editor")
        {
            return BadRequest("Тип доступа должен быть viewer или editor.");
        }

        var access = await _context.FolderAccesses.FindAsync(accessId);

        if (access == null)
        {
            return NotFound("Доступ не найден.");
        }

        access.AccessType = dto.AccessType;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Тип доступа обновлен",
            access.Id,
            access.FolderId,
            access.UserId,
            access.AccessType
        });
    }

    [HttpDelete("{accessId}")]
    public async Task<IActionResult> DeleteAccess(int accessId)
    {
        var access = await _context.FolderAccesses.FindAsync(accessId);

        if (access == null)
        {
            return NotFound("Доступ не найден.");
        }

        _context.FolderAccesses.Remove(access);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Доступ удален"
        });
    }
}