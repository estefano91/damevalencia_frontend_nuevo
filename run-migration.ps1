Write-Host "🚀 Running AURA Sports Database Migrations" -ForegroundColor Cyan
Write-Host ""

# Read the SQL file
$sqlContent = Get-Content "setup_database.sql" -Raw

Write-Host "📄 SQL script loaded:" -ForegroundColor Yellow
Write-Host "   File: setup_database.sql" -ForegroundColor Gray
Write-Host "   Size: $($sqlContent.Length) characters" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  IMPORTANT: This script cannot execute SQL automatically." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 To create your tables, follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your browser and go to:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql" -ForegroundColor Green
Write-Host ""
Write-Host "2. Click on 'New query'" -ForegroundColor White
Write-Host ""
Write-Host "3. Open the file 'setup_database.sql' in this directory" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy ALL the content from setup_database.sql" -ForegroundColor White
Write-Host ""
Write-Host "5. Paste it into the SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "6. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
Write-Host ""
Write-Host "✅ After that, your tables will be created!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check your tables here:" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor" -ForegroundColor Blue
Write-Host ""

# Open the SQL editor in browser
$openChoice = Read-Host "Would you like to open the SQL Editor now? (y/n)"
if ($openChoice -eq 'y' -or $openChoice -eq 'Y') {
    Start-Process "https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql"
}


