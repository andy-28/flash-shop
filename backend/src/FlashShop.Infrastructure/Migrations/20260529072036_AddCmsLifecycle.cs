using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCmsLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "body",
                table: "content_blocks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "published_at",
                table: "content_blocks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "slug",
                table: "content_blocks",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "content_blocks",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.AddColumn<int>(
                name: "version",
                table: "content_blocks",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "content_versions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    content_block_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_number = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    subtitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    link_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    link_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    placement = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    start_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    modified_by = table.Column<Guid>(type: "uuid", nullable: false),
                    change_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_content_versions", x => x.id);
                    table.ForeignKey(
                        name: "FK_content_versions_content_blocks_content_block_id",
                        column: x => x.content_block_id,
                        principalTable: "content_blocks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_content_versions_users_modified_by",
                        column: x => x.modified_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_content_blocks_slug",
                table: "content_blocks",
                column: "slug",
                unique: true,
                filter: "slug IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_content_blocks_status",
                table: "content_blocks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_content_versions_content_block_id_version_number",
                table: "content_versions",
                columns: new[] { "content_block_id", "version_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_content_versions_modified_by",
                table: "content_versions",
                column: "modified_by");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "content_versions");

            migrationBuilder.DropIndex(
                name: "IX_content_blocks_slug",
                table: "content_blocks");

            migrationBuilder.DropIndex(
                name: "IX_content_blocks_status",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "body",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "published_at",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "slug",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "status",
                table: "content_blocks");

            migrationBuilder.DropColumn(
                name: "version",
                table: "content_blocks");
        }
    }
}
