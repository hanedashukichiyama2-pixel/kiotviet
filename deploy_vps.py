import paramiko

host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to SSH...")
    ssh.connect(host, username=username, password=password)
    
    print("Extracting to TRUE web root: /var/www/demo.trangha2004.online/")
    # Ensuring directory exists and unzipping, also clearing old botch if needed
    ssh.exec_command("mkdir -p /var/www/demo.trangha2004.online/")
    
    # We already uploaded /root/v7_deploy.tar.gz earlier, no need to re-upload!
    # Just extract it!
    stdin, stdout, stderr = ssh.exec_command("tar -xvzf /root/v7_deploy.tar.gz -C /var/www/demo.trangha2004.online/ > /dev/null && echo 'SUCCESS'")
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    
    if "SUCCESS" in out:
        print("Extraction complete!")
        # Restart nginx just to be absolutely sure
        ssh.exec_command("systemctl restart nginx")
    else:
        print(f"Stdout: {out}")
        print(f"Stderr: {err}")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
