using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Models;

namespace MemoryApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<PhotoFolder> PhotoFolders => Set<PhotoFolder>();
    public DbSet<FolderAccess> FolderAccesses => Set<FolderAccess>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PhotoFolder>()
            .HasKey(pf => new { pf.PhotoId, pf.FolderId });

        modelBuilder.Entity<Folder>()
            .HasOne(f => f.ParentFolder)
            .WithMany()
            .HasForeignKey(f => f.ParentFolderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FolderAccess>()
            .HasIndex(fa => new { fa.FolderId, fa.UserId })
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}   