@ECHO OFF
SET "sourcedir=src"
SET "destdir=build"
SET "destdircopy=%destdir%\%sourcedir%"
@REM (1) ------------------------------------------------------- CLEAR BEFORE COPY
rmdir /s /q %destdircopy%
@REM (2) ------------------------------------------------------- GET SOURCE PATH LENGTH
Setlocal EnableDelayedExpansion
set "files=0"
pushd %sourcedir%
set ABS_PATH=%CD%
popd
echo "%sourcedir% absolute path is %ABS_PATH%"
call :length srclen "%ABS_PATH%"
@REM (3) ------------------------------------------------------- FOR SUBDIRECTORIES LOOP
for /f "tokens=*" %%G in ('dir /b /s /a:d "%sourcedir%"') do (
    set /a files += 1
    call :length len "%%~fG"
    setlocal enabledelayedexpansion
    SET _path=%%~fG
    SET _startchar=%srclen%
    SET  /A _length=!len!-%srclen%
    CALL SET _substring=%%_path:~!_startchar!,!_length!%%
    set currentpath=%%G
    MKDIR %destdircopy%!_substring!
    copy !currentpath! %destdircopy%!_substring!
)
copy %sourcedir% %destdircopy%
goto :EOF
@REM (4) ------------------------------------------------------- PATH STRING LENGTH
:length <return_var> <string>
setlocal enabledelayedexpansion
if "%~2"=="" (set ret=0) else set ret=1
set "tmpstr=%~2"
for %%I in (4096 2048 1024 512 256 128 64 32 16 8 4 2 1) do (
    if not "!tmpstr:~%%I,1!"=="" (
        set /a ret += %%I
        set "tmpstr=!tmpstr:~%%I!"
    )
)
endlocal & set "%~1=%ret%"
goto :EOF
@REM (5) www.ildar.in/code/snippets/batch_folder_copy_recurcive.bat
