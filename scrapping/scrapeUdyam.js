const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url = "https://udyamregistration.gov.in/UdyamRegistration.aspx";
  const browser = await puppeteer.launch({ headless: false }); // Headless off to see actions
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  console.log("Opening Udyam Registration page...");
  await page.goto(url, { waitUntil: "networkidle2" });

  // Fill Aadhaar & Name
  await page.type("#ctl00_ContentPlaceHolder1_txtadharno", "111122223333");
  await page.type("#ctl00_ContentPlaceHolder1_txtownername", "Test User");

  // Click "Validate & Generate OTP"
  console.log("Clicking 'Validate & Generate OTP' button...");
  await page.waitForSelector("#ctl00_ContentPlaceHolder1_btnValidateAadhar", {
    visible: true,
  });
  await page.click("#ctl00_ContentPlaceHolder1_btnValidateAadhar");

  // Wait for OTP input or PAN input to appear
  console.log("Waiting for OTP or PAN field to appear...");
  await page
    .waitForSelector("input[id*='OTP'], input[id*='pan']", { timeout: 10000 })
    .catch(() => {
      console.warn("⚠ OTP/PAN fields not found within timeout");
    });

  // Function to scrape visible fields
  const scrapeFields = async () => {
    return await page.evaluate(() => {
      const data = [];
      const elements = document.querySelectorAll("input, select, textarea");

      elements.forEach((el) => {
        if (
          el.type === "hidden" ||
          el.type === "submit" ||
          el.style.display === "none"
        )
          return;

        const id = el.id || el.name || "";
        const labelEl =
          document.querySelector(`label[for="${id}"]`) ||
          el.closest("label") ||
          el.parentElement.querySelector("label");

        let label = labelEl ? labelEl.innerText.trim() : id;
        if (label.includes("\n")) label = label.replace(/\s+/g, " ").trim();

        const type =
          el.tagName.toLowerCase() === "select" ? "select" : el.type || "text";

        let options = null;
        if (type === "select") {
          options = Array.from(el.options).map((opt) => ({
            value: opt.value,
            text: opt.text.trim(),
          }));
        }

        data.push({
          id,
          label,
          type,
          required: el.required || false,
          pattern: el.getAttribute("pattern") || null,
          maxlength: el.maxLength > 0 ? el.maxLength : null,
          options,
        });
      });

      return data;
    });
  };

  console.log("Scraping Step 1 fields...");
  const step1 = await scrapeFields();

  console.log("Scraping Step 2 fields...");
  const step2 = await scrapeFields();

  // Merge and remove duplicates
  const allFields = [...step1, ...step2].filter(
    (f, i, arr) => f.id && arr.findIndex((x) => x.id === f.id) === i
  );

  // Add Aadhaar & PAN patterns if missing
  allFields.forEach((f) => {
    if (f.label.toLowerCase().includes("aadhaar") && !f.pattern) {
      f.pattern = "^[0-9]{12}$";
      f.required = true;
    }
    if (f.label.toLowerCase().includes("pan") && !f.pattern) {
      f.pattern = "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$";
      f.required = true;
    }
  });

  // Save to file
  fs.writeFileSync("udyam-schema.json", JSON.stringify(allFields, null, 2));
  console.log(
    `Full scrape complete! Saved ${allFields.length} fields to udyam-schema.json`
  );

  await browser.close();
})();
