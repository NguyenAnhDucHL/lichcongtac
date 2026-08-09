using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace LichCongTac.Api.Hubs
{
    [Authorize]
    public class AppHub : Hub
    {
        // Hub methods can be added here if clients need to send messages to the server.
        // For now, this acts as a conduit for the server to push updates to clients.
        
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("uid")?.Value ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
