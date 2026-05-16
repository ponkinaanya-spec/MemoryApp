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

    [HttpPost("request")]
    public async Task<IActionResult> SendRequest(
        [FromQuery] int senderId,
        [FromQuery] int receiverId)
    {
        if (senderId == receiverId)
        {
            return BadRequest("Нельзя добавить себя.");
        }

        var alreadyFriends = await _context.Friendships
            .AnyAsync(f =>
                f.UserId == senderId &&
                f.FriendId == receiverId);

        if (alreadyFriends)
        {
            return BadRequest("Пользователь уже в друзьях.");
        }

        var requestExists = await _context.FriendRequests
            .AnyAsync(r =>
                r.SenderId == senderId &&
                r.ReceiverId == receiverId);

        if (requestExists)
        {
            return BadRequest("Заявка уже отправлена.");
        }

        var request = new FriendRequest
        {
            SenderId = senderId,
            ReceiverId = receiverId
        };

        _context.FriendRequests.Add(request);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Заявка отправлена"
        });
    }

    [HttpGet("requests/{userId}")]
    public async Task<IActionResult> GetRequests(int userId)
    {
        var requests = await _context.FriendRequests
            .Where(r => r.ReceiverId == userId)
            .Include(r => r.Sender)
            .Select(r => new
            {
                r.Id,
                SenderId = r.Sender.Id,
                r.Sender.Username,
                r.Sender.Email,
                r.Sender.AvatarUrl
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptRequest(
        [FromQuery] int requestId)
    {
        var request = await _context.FriendRequests
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            return NotFound("Заявка не найдена.");
        }

        var friendship1 = new Friendship
        {
            UserId = request.SenderId,
            FriendId = request.ReceiverId
        };

        var friendship2 = new Friendship
        {
            UserId = request.ReceiverId,
            FriendId = request.SenderId
        };

        _context.Friendships.Add(friendship1);
        _context.Friendships.Add(friendship2);

        _context.FriendRequests.Remove(request);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Заявка принята"
        });
    }

    [HttpDelete("decline")]
    public async Task<IActionResult> DeclineRequest(
        [FromQuery] int requestId)
    {
        var request = await _context.FriendRequests
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            return NotFound("Заявка не найдена.");
        }

        _context.FriendRequests.Remove(request);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Заявка отклонена"
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