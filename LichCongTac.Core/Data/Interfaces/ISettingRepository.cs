using System;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface ISettingRepository
    {
        string GetAppSetting(string key, string defaultVal = "");
        void SaveAppSetting(string key, string val);
    }
}
