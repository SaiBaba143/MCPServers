import com.microsoft.playwright.*;

public class rahulshetty {
    public static void main(String[] args) {
        // Initialize Playwright
        Playwright playwright = Playwright.create();
        Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false));
        BrowserContext context = browser.newContext();
        Page page = context.newPage();
        
        try {
            // Navigate to the website
            page.navigate("https://www.rahulshettyacademy.com");
            System.out.println("Navigated to https://www.rahulshettyacademy.com");
            
            // Wait for page to load
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // Find and click on QA Jobs link
            page.click("a:has-text('QA Jobs'), a:has-text('Jobs')");
            System.out.println("Clicked on QA Jobs");
            
            // Wait for the page to load
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // Find and click on Sign Up button
            page.click("button:has-text('Sign Up'), button:has-text('signup')");
            System.out.println("Clicked on Sign Up button");
            
            // Wait for sign up page to load
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // Click on Candidate radio button option
            page.click("input[value='candidate'], label:has-text('Candidate')");
            System.out.println("Selected Candidate option");
            
            // Wait for form to update
            page.waitForTimeout(1000);
            
            // Fill in the email field
            page.fill("input[type='email'], input[name='email'], input[id='email']", "saibabakaradi4@gmail.com");
            System.out.println("Successfully filled in the email: saibabakaradi4@gmail.com");
            
            System.out.println("Candidate option selected");
            System.out.println("Form filled but NOT submitted as requested");
            
            // Wait before closing
            page.waitForTimeout(3000);
            
        } catch (PlaywrightException e) {
            System.out.println("Playwright error occurred: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println("Error occurred: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Close the browser
            context.close();
            browser.close();
            playwright.close();
        }
    }
}
