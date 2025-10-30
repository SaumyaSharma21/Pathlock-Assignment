using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Extensions;

namespace MiniProjectManager.Api
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // register application services (DbContext, JWT, repos, services)
            builder.Services.AddApplicationServices(builder.Configuration);

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                // configure JWT Bearer token support in Swagger UI
                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter 'Bearer' [space] and then your valid token in the text input below."
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            builder.Services.AddControllers();

            // Add CORS policy for frontend development (Vite: 8080, 8082)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(
                        "http://localhost:8080",
                        "http://localhost:8082",
                        "http://localhost:5173",
                        "http://localhost:3000"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapGet("/hello", () => "Hello World!");

            // Ensure migrations are applied and seed data exists (development)
            try
            {
                using (var scope = app.Services.CreateScope())
                {
                    var services = scope.ServiceProvider;
                    var db = services.GetRequiredService<MiniProjectManager.Api.Data.AppDbContext>();
                    db.Database.Migrate();
                }

                // run async seeding but don't block startup long
                _ = MiniProjectManager.Api.Data.SeedData.EnsureSeedDataAsync(app.Services);
            }
            catch (Exception ex)
            {
                // swallow exceptions during migrate/seed to avoid preventing the app from starting in edge cases;
                Console.WriteLine($"Warning: migration/seed failed: {ex.Message}");
            }

            app.Run();
        }
    }
}
