using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BackfillCmsLifecycleStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE content_blocks
                SET status = 'Published',
                    published_at = COALESCE(published_at, updated_at),
                    version = GREATEST(version, 1)
                WHERE is_active = true
                  AND status = 'Draft';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE content_blocks
                SET status = 'Draft',
                    published_at = NULL
                WHERE status = 'Published';
                """);
        }
    }
}
