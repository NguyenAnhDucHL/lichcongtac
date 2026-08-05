# Stage 1: Base - Cài đặt các công cụ hệ thống cần thiết (Dùng chung cho cả Dev và Prod)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
WORKDIR /app

# Install native dependencies for PaddleOCR and SkiaSharp
RUN apt-get update && apt-get install -y \
    libgdiplus \
    libc6-dev \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*


# Stage 2: Frontend Build
FROM node:22-alpine AS client-build
WORKDIR /src/LichCongTac.Api/ClientApp
COPY ["LichCongTac.Api/ClientApp/package.json", "LichCongTac.Api/ClientApp/package-lock.json", "./"]
RUN npm install --legacy-peer-deps
COPY ["LichCongTac.Api/ClientApp/", "./"]
COPY ["LichCongTac.Api/wwwroot/", "../wwwroot/"]
RUN npm run build

# Stage 3: Build
FROM base AS build
WORKDIR /src
COPY ["LichCongTac.Api/LichCongTac.Api.csproj", "LichCongTac.Api/"]
COPY ["LichCongTac.Core/LichCongTac.Core.csproj", "LichCongTac.Core/"]
RUN dotnet restore "LichCongTac.Api/LichCongTac.Api.csproj" --disable-parallel
COPY . .
COPY --from=client-build /src/LichCongTac.Api/wwwroot ./LichCongTac.Api/wwwroot
WORKDIR "/src/LichCongTac.Api"
RUN dotnet build "LichCongTac.Api.csproj" -c Release -o /app/build

# Stage 4: Publish
FROM build AS publish
RUN dotnet publish "LichCongTac.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 5: Final Runtime (Sử dụng aspnet để tối ưu dung lượng khi chạy thật)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
# Phải cài lại dependencies vì aspnet image khác với sdk image
RUN apt-get update && apt-get install -y \
    libgdiplus \
    libc6-dev \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*
COPY --from=publish /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "LichCongTac.Api.dll"]
