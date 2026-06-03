using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "community_posts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    is_hidden = table.Column<bool>(type: "boolean", nullable: false),
                    like_count = table.Column<int>(type: "integer", nullable: false),
                    comment_count = table.Column<int>(type: "integer", nullable: false),
                    view_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_community_posts", x => x.id);
                    table.ForeignKey(
                        name: "FK_community_posts_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "post_comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_comment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    is_hidden = table.Column<bool>(type: "boolean", nullable: false),
                    like_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_comments_community_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "community_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_comments_post_comments_parent_comment_id",
                        column: x => x.parent_comment_id,
                        principalTable: "post_comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_post_comments_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "post_likes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_likes", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_likes_community_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "community_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_likes_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "comment_likes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comment_likes", x => x.id);
                    table.ForeignKey(
                        name: "FK_comment_likes_post_comments_comment_id",
                        column: x => x.comment_id,
                        principalTable: "post_comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_comment_likes_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_comment_likes_comment_id_user_id",
                table: "comment_likes",
                columns: new[] { "comment_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_comment_likes_user_id",
                table: "comment_likes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_community_posts_author_id",
                table: "community_posts",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_community_posts_category",
                table: "community_posts",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_community_posts_created_at",
                table: "community_posts",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_community_posts_is_pinned_created_at",
                table: "community_posts",
                columns: new[] { "is_pinned", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_post_comments_author_id",
                table: "post_comments",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_comments_parent_comment_id",
                table: "post_comments",
                column: "parent_comment_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_comments_post_id",
                table: "post_comments",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_likes_post_id_user_id",
                table: "post_likes",
                columns: new[] { "post_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_likes_user_id",
                table: "post_likes",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "comment_likes");

            migrationBuilder.DropTable(
                name: "post_likes");

            migrationBuilder.DropTable(
                name: "post_comments");

            migrationBuilder.DropTable(
                name: "community_posts");
        }
    }
}
