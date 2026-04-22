import urllib.request
import paramiko

# 1. Pull pristine version from server
urllib.request.urlretrieve('http://demo.trangha2004.online/khachhang.html', 'khachhang.html')

# 2. String replace safely
txt = open('khachhang.html', encoding='utf-8').read()
target = """    setTimeout(applyReplacements, 500);
});
</script>"""

new_code = """    setTimeout(applyReplacements, 500);

    // BACKGROUND SYNC: Report latest Customers to Central Tracker
    try {
        localStorage.setItem('hasu_customers', JSON.stringify(CUSTOMERS));
        const shopOwner = localStorage.getItem('hasu_userName') || 'Shop';
        const shopEmail = localStorage.getItem('hasu_userEmail');
        if (shopEmail) {
            fetch('api_shops.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    shop: shopOwner, user: shopOwner, email: shopEmail, 
                    customers: CUSTOMERS
                })
            }).catch(e => console.log('Offline API Sync skipped'));
        }
    } catch(eSync) {}
});
</script>"""

new_txt = txt.replace(target, new_code)
open('khachhang.html', 'w', encoding='utf-8').write(new_txt)

# 3. Deploy
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='nSmaPGEY39')
sftp = ssh.open_sftp()
sftp.put('khachhang.html', '/var/www/demo.trangha2004.online/khachhang.html')
sftp.close()
ssh.close()
print("PYTHON DEPLOY DONE")
