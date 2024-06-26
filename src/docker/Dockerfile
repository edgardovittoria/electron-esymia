FROM rabbitmq:3.13-management

COPY rabbitmq.conf /etc/rabbitmq
COPY definitions.json /etc/rabbitmq

RUN cat /etc/rabbitmq/rabbitmq.conf
RUN rabbitmq-plugins enable --offline rabbitmq_web_stomp