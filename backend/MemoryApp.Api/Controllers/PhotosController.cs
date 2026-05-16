using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Models;
using MemoryApp.Api.Dtos;
using MemoryApp.Api.Services;
using MemoryApp.Api.Dtos;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly AccessService _accessService;

    public PhotosController(
        AppDbContext context,
        IWebHostEnvironment environment,
        AccessService accessService)
    {
        _context = context;
        _environment = environment;
        _accessService = accessService;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto([FromForm] UploadPhotoDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
        {
            return BadRequest("Файл не выбран.");
        }

        var ownerExists = await _context.Users.AnyAsync(u => u.Id == dto.OwnerId);

        if (!ownerExists)
        {
            return BadRequest("Пользователь не найден.");
        }

        if (dto.FolderIds == null || dto.FolderIds.Count == 0)
        {
            return BadRequest("Нужно выбрать хотя бы одну папку.");
        }

        var folders = await _context.Folders
            .Where(f => dto.FolderIds.Contains(f.Id))
            .ToListAsync();

        if (folders.Count != dto.FolderIds.Count)
        {
            return BadRequest("Одна или несколько папок не найдены.");
        }
        foreach (var folderId in dto.FolderIds)
        {
            var canEdit = await _accessService.CanEditFolder(
                dto.OwnerId,
                folderId);

            if (!canEdit)
            {
                return StatusCode(403,
                    $"Нет доступа к папке {folderId}");
            }
        }

        var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");

        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        var extension = Path.GetExtension(dto.File.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/{fileName}";

        var photo = new Photo
        {
            OwnerId = dto.OwnerId,
            FileUrl = fileUrl,
            ThumbnailUrl = fileUrl,
            Note = dto.Note,
            UploadedAt = DateTime.UtcNow
        };

        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();

        foreach (var folderId in dto.FolderIds)
        {
            _context.PhotoFolders.Add(new PhotoFolder
            {
                PhotoId = photo.Id,
                FolderId = folderId
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Фото загружено",
            photo.Id,
            photo.FileUrl,
            photo.ThumbnailUrl,
            photo.Note,
            photo.UploadedAt,
            FolderIds = dto.FolderIds
        });
    }


    [HttpGet("folder/{folderId}")]
    public async Task<IActionResult> GetPhotosByFolder(
        int folderId,
        [FromQuery] int userId)
    {
        var canView = await _accessService
            .CanViewFolder(userId, folderId);

        if (!canView)
        {
            return StatusCode(403,
                "Нет доступа к папке.");
        }
        var photos = await _context.PhotoFolders
            .Where(pf => pf.FolderId == folderId)
            .Include(pf => pf.Photo)
            .ThenInclude(p => p.Owner)
            .OrderByDescending(pf => pf.Photo.UploadedAt)
            .Select(pf => new
            {
                pf.Photo.Id,
                pf.Photo.FileUrl,
                pf.Photo.ThumbnailUrl,
                pf.Photo.Note,
                pf.Photo.UploadedAt,
                OwnerId = pf.Photo.Owner.Id,
                OwnerName = pf.Photo.Owner.Username
            })
            .ToListAsync();

        return Ok(photos);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPhotos(int userId)
    {
        var photos = await _context.Photos
            .Where(p => p.OwnerId == userId)
            .OrderByDescending(p => p.UploadedAt)
            .Select(p => new
            {
                p.Id,
                p.FileUrl,
                p.ThumbnailUrl,
                p.Note,
                p.UploadedAt
            })
            .ToListAsync();

        return Ok(photos);
    }

    [HttpGet("{photoId}")]
    public async Task<IActionResult> GetPhoto(int photoId)
    {
        var photo = await _context.Photos
            .Include(p => p.Owner)
            .Where(p => p.Id == photoId)
            .Select(p => new
            {
                p.Id,
                p.FileUrl,
                p.ThumbnailUrl,
                p.Note,
                p.UploadedAt,
                OwnerId = p.Owner.Id,
                OwnerName = p.Owner.Username
            })
            .FirstOrDefaultAsync();

        if (photo == null)
        {
            return NotFound("Фото не найдено.");
        }

        return Ok(photo);
    }

    [HttpPut("{photoId}/note")]
    public async Task<IActionResult> UpdatePhotoNote(
        int photoId,
        UpdatePhotoNoteDto dto)
    {
        var photo = await _context.Photos.FindAsync(photoId);

        if (photo == null)
        {
            return NotFound("Фото не найдено.");
        }

        photo.Note = dto.Note;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Заметка обновлена",
            photo.Id,
            photo.Note
        });
    }

    [HttpDelete("{photoId}")]
    public async Task<IActionResult> DeletePhoto(int photoId)
    {
        var photo = await _context.Photos.FindAsync(photoId);

        if (photo == null)
        {
            return NotFound("Фото не найдено.");
        }

        var filePath = Path.Combine(
            _environment.WebRootPath,
            photo.FileUrl.TrimStart('/')
        );

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Фото удалено"
        });
    }
}