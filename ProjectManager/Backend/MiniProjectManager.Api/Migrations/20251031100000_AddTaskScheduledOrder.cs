using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniProjectManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskScheduledOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScheduledOrder",
                table: "Tasks",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScheduledOrder",
                table: "Tasks");
        }
    }
}
