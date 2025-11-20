
from playwright.sync_api import sync_playwright, expect

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local server
            page.goto("http://localhost:3000")

            # Wait for the 3D container to be present
            page.wait_for_selector("#three-container")

            # Wait for the hero title to be visible
            expect(page.locator(".hero-title")).to_be_visible()

            # Wait a bit for animations to start (particles, blob)
            page.wait_for_timeout(3000)

            # Take a screenshot of the Hero Section
            page.screenshot(path="verification/hero_enhanced.png")
            print("Screenshot taken: verification/hero_enhanced.png")

            # Scroll down to see transparency effects on cards
            page.evaluate("window.scrollBy(0, 800)")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/cards_transparent.png")
            print("Screenshot taken: verification/cards_transparent.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
