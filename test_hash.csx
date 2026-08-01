using System;
using Microsoft.AspNetCore.Identity;

var hasher = new PasswordHasher<object>();
var hash = "AQAAAAIAAYagAAAAEFb7ReyaKU8uYGYsVQw1WCM+Ei0b6Y9ZB5nl2cDBmeU1nNeAkMYIagR5q5TGHIrP+g==";
var result = hasher.VerifyHashedPassword(null, hash, "CamPha@2026!");
Console.WriteLine($"Matches CamPha@2026!: {result}");
