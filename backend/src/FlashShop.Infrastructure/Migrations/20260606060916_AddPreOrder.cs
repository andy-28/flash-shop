using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPreOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "estimated_arrival_date",
                table: "product_variants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_pre_order",
                table: "product_variants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "pre_order_count",
                table: "product_variants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "order_type",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Normal");

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    link_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_notifications_user_id_is_read_created_at",
                table: "notifications",
                columns: new[] { "user_id", "is_read", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropColumn(
                name: "estimated_arrival_date",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "is_pre_order",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "pre_order_count",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "order_type",
                table: "orders");
        }
    }
}
