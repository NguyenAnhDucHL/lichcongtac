using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string dbHash = "$2a$12$w.2D5x1t262P2.TqHMy2qOeHOf8e9x.7Z7Y/kYqU3R8P7b8Vw7j3O";
        Console.WriteLine(BCrypt.Net.BCrypt.Verify("CamPha@2026!", dbHash));
    }
}
