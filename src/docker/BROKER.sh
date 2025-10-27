arch=$(uname -m)
if (! docker stats --no-stream ); then
    echo "Please start Docker"
    exit 10
else
    docker network create app-network
    if [ "$arch" = "x86_64" ] || [ "$arch" = "amd64" ]; then
        docker pull edgardovittoria/rabbitmqamd64:latest
        docker run --rm --name rabbitmq --network app-network -p 5672:5672 -p 15672:15672 -p 15674:15674 edgardovittoria/rabbitmqamd64:latest
    else
        docker pull edgardovittoria/rabbitmqarm64:latest
        docker run --rm --name rabbitmq --network app-network -p 5672:5672 -p 15672:15672 -p 15674:15674 edgardovittoria/rabbitmqarm64:latest
    fi
fi
