import paramiko

host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    # Search for the old hasu project or nhaphang.html
    stdin, stdout, stderr = ssh.exec_command("find / -maxdepth 5 -name 'nhaphang.html' 2>/dev/null")
    paths = stdout.read().decode('utf-8').strip()
    if paths:
        print(f"FOUND: {paths}")
    else:
        print("Not found in first 5 levels, trying locate or locate...")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
