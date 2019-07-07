# Peripheral Pi 1

Connected to all sensors and actuators 

### RabbitMQ Broker Configuration

The RabbitMQ Broker/Server needs to be configured before it can be accessed from a remote machine.

For a local client, there is no need to use virtual hosts and users:

``` python 
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost')) 
```

But for remote clients, the IP-Address, port, virtual host, and credentials need to be provided:

``` python 
credentials = pika.PlainCredentials(<username>, <password>)
```

``` python 
connection = pika.BlockingConnection(pika.ConnectionParameters('192.168.xxx.xxx', 5672, '/', credentials))
```

The user needs to be created and given permissions for virtual host ('/' default) and topic exchange:

`rabbitmqctl set_permissions <username> .* .* .*`

`rabbitmqctl set_topic_permissions <username> topic_data .* .*`

* The commands are entered in the RabbitMQ Command Prompt.

* The windows firewall needs to be disabled to access a broker running on a windows computer.
