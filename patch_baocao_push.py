import paramiko

baocao_path = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

script_block = """
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (!uName) {
        window.location.href = 'login.html';
        return;
    }

    var isAdmin = (uEmail === 'admin@hasu.vn' || uEmail === 'tester@hasu.vn');

    function applyReplacements() {
        var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.nodeName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);
        var n;
        while(n = walk.nextNode()) {
            if (n.nodeValue.includes('Tester')) {
                n.nodeValue = n.nodeValue.replace(/Tester/g, uName);
            }
            if (uEmail && n.nodeValue.includes('tester@hasu.vn')) {
                n.nodeValue = n.nodeValue.replace(/tester@hasu\\.vn/g, uEmail);
            }
        }
    }

    applyReplacements();
    setTimeout(applyReplacements, 150);
});
</script>
"""

import re
with open(baocao_path, 'r', encoding='utf-8') as f:
    baocao_content = f.read()

if "localStorage.getItem('hasu_userName')" not in baocao_content:
    baocao_content = re.sub(r'(?i)</body>', script_block + '\n</body>', baocao_content, count=1)
    with open(baocao_path, 'w', encoding='utf-8') as f:
        f.write(baocao_content)
    print("Patched baocao.html locally!")
else:
    print("Already patched locally!")

host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    sftp = ssh.open_sftp()
    sftp.put(baocao_path, '/var/www/demo.trangha2004.online/baocao.html')
    sftp.close()
    print("Uploaded baocao.html directly to web root!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
