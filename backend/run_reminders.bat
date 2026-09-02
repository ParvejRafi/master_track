@echo off
cd /d "%~dp0"
"venv\Scripts\python.exe" manage.py send_deadline_reminders >> reminders.log 2>&1
