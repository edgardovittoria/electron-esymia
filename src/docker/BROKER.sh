cd "$1"
which docker;
if [[ $? != 0 ]] ; then
    printf "docker not installed"
    exit 10
else
    #Open Docker, only if is not running
    if (! docker stats --no-stream ); then
        # On Mac OS this would be the terminal command to launch Docker
        open -a Docker
        #Wait until Docker daemon is running and has completed initialisation
        while (! docker stats --no-stream ); do
        # Docker takes a few seconds to initialize
        echo "Waiting for Docker to launch..."
        sleep 1
        done
    fi
    if [ -z "$(docker images -q rabbitmq_broker:v1 2> /dev/null)" ]; then
        docker build --tag "rabbitmq_broker:v1" .
    else
        if [ "$( docker container inspect -f '{{.State.Running}}' rabbitmq )" = "true" ]; then
            echo "stop"
            docker stop rabbitmq
        fi
    fi
    docker run --rm --name rabbitmq -p 5672:5672 -p 15672:15672 -p 15674:15674 rabbitmq_broker:v1
fi
