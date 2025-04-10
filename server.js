from flask import Flask, jsonify, request
from playwright.sync_api import sync_playwright
import requests

app = Flask(__name__)

@app.route('/bypass', methods=['GET'])
def bypass():
    target_url = request.args.get('url')
    if not target_url:
        return jsonify({'success': False, 'error': 'Missing url parameter'}), 400

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Navigate to the linkvertise page and load the captcha
            page.goto('https://rip.linkvertise.lol', wait_until='domcontentloaded')
            page.add_script_tag(url='https://rip.linkvertise.lol/cdn/BotChallenger_CAPTCHA.js')

            # Wait for the BotChallenger token
            page.wait_for_function('window.__BotChallenger__?.getToken')

            # Get the token from the page's context
            token = page.evaluate('''() => {
                window.BCConfig.Hostname = "rip.linkvertise.lol";
                return window.__BotChallenger__.getToken()[0];
            }''')

            browser.close()

            # Fetch the bypassed link using the token
            response = requests.get(f'https://bypassunlock.usk.lol/gw/bypass?url={target_url}&tk={token}')
            json_data = response.json()

            return jsonify(json_data)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
