using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Models;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FriendsController : ControllerBase
{
    private readonly AppDbContext _context;

    public FriendsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetFriends(int userId)
    {
        var friends = await _context.Friendships
            .Where(f => f.UserId == userId)
            .Include(f => f.Friend)
            .Select(f => new
            {
                f.Friend.Id,
                f.Friend.Username,
                f.Friend.Email,
                f.Friend.AvatarUrl
            })
            .ToListAsync();

        return Ok(friends);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddFriend(
        [FromQuery] int userId,
        [FromQuery] int friendId)
    {
        if (userId == friendId)
        {
            return BadRequest("Нельзя добавить себя.");
        }

        var exists = await _context.Friendships.AnyAsync(f =>
            f.UserId == userId &&
            f.FriendId == friendId);

        if (exists)
        {
            return BadRequest("Пользователь уже в друзьях.");
        }

        var friendship1 = new Friendship
        {
            UserId = userId,
            FriendId = friendId
        };

        var friendship2 = new Friendship
        {
            UserId = friendId,
            FriendId = userId
        };

        _context.Friendships.Add(friendship1);
        _context.Friendships.Add(friendship2);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Друг добавлен"
        });
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveFriend(
        [FromQuery] int userId,
        [FromQuery] int friendId)
    {
        var friendships = await _context.Friendships
            .Where(f =>
                (f.UserId == userId && f.FriendId == friendId) ||
                (f.UserId == friendId && f.FriendId == userId))
            .ToListAsync();

        _context.Friendships.RemoveRange(friendships);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Друг удалён"
        });
    }
}