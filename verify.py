from playwright.sync_api import sync_playwright

def verify_grid():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")
        page.wait_for_timeout(2000)
        page.screenshot(path="verification.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    verify_grid()
