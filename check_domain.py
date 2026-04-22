import paramiko
import re

host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    
    print("Searching Nginx configs...")
    stdin, stdout, stderr = ssh.exec_command("grep -ir 'demo.trangha2004.online' /etc/nginx/")
    print(stdout.read().decode('utf-8'))
    
    print("Searching Apache configs...")
    stdin, stdout, stderr = ssh.exec_command("grep -ir 'demo.trangha2004.online' /etc/apache2/ /etc/httpd/ /www/server/panel/vhost/")
    print(stdout.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
