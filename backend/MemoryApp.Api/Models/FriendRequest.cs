namespace MemoryApp.Api.Models;

public class FriendRequest
{
    public int Id { get; set; }

    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public int ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}