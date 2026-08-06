using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace LichCongTac.Api.Hubs
{
    public class AppHub : Hub
    {
        // Hub methods can be added here if clients need to send messages to the server.
        // For now, this acts as a conduit for the server to push updates to clients.
        
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
