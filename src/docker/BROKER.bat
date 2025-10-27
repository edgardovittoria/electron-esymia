@ECHO OFF
SETLOCAL

REM --- Docker Status Check ---
REM The command 'docker stats --no-stream' returns an error code (non-zero ERRORLEVEL) if the Docker daemon is not running.
ECHO.
ECHO Checking if Docker is running...
docker stats --no-stream >nul 2>&1

IF ERRORLEVEL 1 (
    GOTO DOCKER_NOT_RUNNING
)

GOTO DOCKER_RUNNING

:DOCKER_NOT_RUNNING
    ECHO.
    ECHO !!! ERROR !!!
    ECHO Please start Docker desktop application.
    EXIT /B 10

:DOCKER_RUNNING
    ECHO Docker is running.

    REM Create the network. We suppress output/errors in case it already exists.
    ECHO Creating Docker network "app-network"...
    docker network create app-network >nul 2>&1

    REM Detect architecture using built-in Windows environment variable.
    SET ARCH=%PROCESSOR_ARCHITECTURE%
    SET RABBITMQ_IMAGE=

    REM --- Architecture Check using robust GOTO structure ---
    REM Check for x86_64 / amd64 equivalent (AMD64 in Windows)
    IF /I "%ARCH%"=="AMD64" GOTO X64_ARCH

:ARM_ARCH
    REM Assuming aarch64 / arm64 equivalent (ARM64 in Windows or other architecture)
    ECHO Assuming ARM64 or other architecture (Detected: %ARCH%).
    SET RABBITMQ_IMAGE=edgardovittoria/rabbitmqarm64:latest
    GOTO RUN_DOCKER

:X64_ARCH
    ECHO Detected AMD64/x64 architecture.
    SET RABBITMQ_IMAGE=edgardovittoria/rabbitmqamd64:latest
    REM Execution will fall through to :RUN_DOCKER

:RUN_DOCKER
    REM Pull and run the container
    ECHO Pulling and running image: %RABBITMQ_IMAGE%
    ECHO.
    docker run --rm --name rabbitmq --network app-network -p 5672:5672 -p 15672:15672 -p 15674:15674 %RABBITMQ_IMAGE%

    ECHO.
    ECHO RabbitMQ container stopped or removed.

EXIT /B 0
