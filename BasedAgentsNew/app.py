from flask import Flask, redirect, request
from coinbase_commerce.client import Client
from coinbase_commerce.webhook import Webhook
from coinbase_commerce.error import SignatureVerificationError

app = Flask(__name__)
app.secret_key = 'b3f2d4c8a2e9f4a8c7e6d1b9f8a4d3c1'  # Strong random string for Flask's secret key

# Configure Coinbase Commerce Client with your API Key
API_KEY = 'cb4c142f-795a-4be0-a51a-be595864975b'  # Your Coinbase Commerce API Key
client = Client(api_key=API_KEY)

# Webhook secret for verifying Coinbase Commerce webhooks
WEBHOOK_SECRET = """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIIiyQq4zmx9wvzKgSq1uEl9PF9NDbqW14tytscXASteWoAo
AwEHoUQDQgAEKOcHjJDBuNvdZvDgvOP0tR4xtCVTRKjyi9KOolzfVhF
RZwQbyNos8ohcWaFjK+cJv2m0orKPjhG6g==
-----END EC PRIVATE KEY-----
"""

@app.route('/')
def home():
    return '''
        <h1>Welcome to Beyond Borders Consulting</h1>
        <p>Pay for services with cryptocurrency:</p>
        <a href="/create_charge">Make a Payment</a>
    '''

@app.route('/create_charge')
def create_charge():
    charge_info = {
        'name': 'Consulting Service',
        'description': 'Payment for consulting services',
        'local_price': {
            'amount': '100.00',  # Set your desired amount
            'currency': 'USD'    # Use your preferred currency
        },
        'pricing_type': 'fixed_price'
    }
    charge = client.charge.create(**charge_info)
    return redirect(charge.hosted_url)

@app.route('/webhook', methods=['POST'])
def webhook():
    request_data = request.data.decode('utf-8')
    request_sig = request.headers.get('X-CC-Webhook-Signature', None)
    try:
        event = Webhook.construct_event(request_data, request_sig, WEBHOOK_SECRET)
    except (ValueError, SignatureVerificationError) as e:
        return str(e), 400

    if event['type'] == 'charge:confirmed':
        print("Payment confirmed!")
        # Add additional logic here if needed (e.g., update a database, send an email)
    return '', 200

if __name__ == '__main__':
    app.run(debug=True)

