$zipFile = "dad_src.zip"

if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# ✅ เลือกเฉพาะโฟลเดอร์และไฟล์ที่ต้องการ
$include = @(
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "tailwind.config.js",
    "nginx.conf",
    "docker-compose.yml",
    "Dockerfile",
    ".env"
)

Compress-Archive -Path $include -DestinationPath $zipFile -Force
Write-Host ("Zip file " + $zipFile + " created successfully")
