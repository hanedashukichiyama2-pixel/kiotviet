import paramiko

filepath = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

ugly_code = "time: o.time.substring(5,16).replace('-','/'),"
pretty_code = "time: (function(t){const d=new Date(t.replace(' ', 'T')); return isNaN(d)?t:(String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'));})(o.time),"

if ugly_code in content:
    content = content.replace(ugly_code, pretty_code)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# SFTP Sync
host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    sftp = ssh.open_sftp()
    sftp.put(filepath, '/var/www/demo.trangha2004.online/baocao.html')
    sftp.close()
    print("SUCCESS: baocao.html time format patched and uploaded!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
