using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniProjectManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimatedHoursAndDependencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Dependencies",
                table: "Tasks",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedHours",
                table: "Tasks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Dependencies",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "EstimatedHours",
                table: "Tasks");
        }
    }
}
