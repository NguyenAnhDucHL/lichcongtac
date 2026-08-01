using System;
using BCrypt.Net;

string dbHash = "$2a$12$8CESOUb0PvnhyWq4SWs/tu/i46Ulc9yWDSPIVDkv17u0rsxeiGotG";
Console.WriteLine(BCrypt.Net.BCrypt.Verify("CamPha@2026!", dbHash));
