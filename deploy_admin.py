import paramiko
import os

host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

files_to_push = [
    r"c:\xampp\htdocs\hasu_nentangso\login.html",
    r"c:\xampp\htdocs\hasu_nentangso\admin.html",
    r"c:\xampp\htdocs\hasu_nentangso\api_shops.php"
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    sftp = ssh.open_sftp()
    
    for local_path in files_to_push:
        remote_path = "/var/www/demo.trangha2004.online/" + os.path.basename(local_path)
        sftp.put(local_path, remote_path)
        print(f"Uploaded {os.path.basename(local_path)} to {remote_path}")
        
    sftp.close()
    print("SUCCESS: Deployment completed!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
