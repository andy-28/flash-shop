using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContentCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "content_versions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "summary",
                table: "content_versions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "video_url",
                table: "content_versions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "content_blocks",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "summary",
                table: "content_blocks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "video_url",
                table: "content_blocks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "view_count",
                table: "content_blocks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_content_blocks_category",
                table: "content_blocks",
                column: "category");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_content_blocks_category",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "category",
                table: "content_versions");

            migrationBuilder.DropColumn(
                name: "summary",
                table: "content_versions");

            migrationBuilder.DropColumn(
                name: "video_url",
                table: "content_versions");

            migrationBuilder.DropColumn(
                name: "category",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "summary",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "video_url",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "view_count",
                table: "content_blocks");
        }
    }
}
