import urllib.request
import json
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def login(identifier, password):
    url = "http://localhost:8080/api/auth/login"
    data = json.dumps({"identifier": identifier, "password": password, "rememberMe": False}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_data = response.read().decode('utf-8')
            print(f"Login {identifier} SUCCESS: {response.getcode()}")
            return json.loads(res_data)['accessToken']
    except urllib.error.HTTPError as e:
        print(f"Login {identifier} FAILED: {e.code} - {e.read().decode('utf-8')}")
        return None

admin_password = os.environ.get("ADMIN_PASSWORD")
sales_password = os.environ.get("SALES_PASSWORD")

if not admin_password or not sales_password:
    raise SystemExit("ADMIN_PASSWORD and SALES_PASSWORD environment variables are required")

admin_token = login("admin", admin_password)
sales_token = login("sales", sales_password)

if admin_token and sales_token:
    print("Tokens generated successfully!")
