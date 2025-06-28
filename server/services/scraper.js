const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class WebScraper {
  constructor() {
    this.browser = null;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  extractWebsite(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'unknown';
    }
  }

  async scrapeProduct(url) {
    const website = this.extractWebsite(url);
    
    try {
      switch (website) {
        case 'amazon.com':
        case 'amazon.in':
        case 'amazon.co.uk':
          return await this.scrapeAmazon(url);
        case 'flipkart.com':
          return await this.scrapeFlipkart(url);
        case 'ebay.com':
        case 'ebay.in':
          return await this.scrapeEbay(url);
        case 'walmart.com':
          return await this.scrapeWalmart(url);
        case 'target.com':
          return await this.scrapeTarget(url);
        default:
          return await this.scrapeGeneric(url);
      }
    } catch (error) {
      console.error(`Error scraping ${website}:`, error.message);
      throw new Error(`Failed to scrape product from ${website}: ${error.message}`);
    }
  }

  async scrapeAmazon(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Add headers to avoid detection
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const productData = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();
        
        const priceElement = document.querySelector('.a-price-whole') ||
                           document.querySelector('.a-price .a-offscreen') ||
                           document.querySelector('#priceblock_ourprice') ||
                           document.querySelector('#priceblock_dealprice');
        
        const price = priceElement ? 
          parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const originalPriceElement = document.querySelector('.a-text-strike') ||
                                   document.querySelector('.a-price.a-text-price .a-offscreen');
        
        const originalPrice = originalPriceElement ? 
          parseFloat(originalPriceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const image = document.querySelector('#landingImage')?.src ||
                     document.querySelector('#imgBlkFront')?.src ||
                     document.querySelector('.a-dynamic-image')?.src;
        
        const description = document.querySelector('#productDescription')?.textContent?.trim() ||
                          document.querySelector('#feature-bullets')?.textContent?.trim();
        
        const availability = document.querySelector('#availability')?.textContent?.toLowerCase().includes('in stock') ? 
          'in_stock' : 'out_of_stock';

        return {
          title,
          price,
          originalPrice,
          image,
          description,
          availability
        };
      });

      return {
        ...productData,
        website: 'amazon',
        url
      };
    } finally {
      await page.close();
    }
  }

  async scrapeFlipkart(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1[class*="title"]')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();
        
        const priceElement = document.querySelector('div[class*="price"]') ||
                           document.querySelector('[data-testid="price"]');
        
        const price = priceElement ? 
          parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const originalPriceElement = document.querySelector('div[class*="strike"]') ||
                                   document.querySelector('[data-testid="original-price"]');
        
        const originalPrice = originalPriceElement ? 
          parseFloat(originalPriceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const image = document.querySelector('img[class*="product-image"]')?.src ||
                     document.querySelector('.product-image img')?.src;
        
        const availability = document.querySelector('button[class*="add-to-cart"]') ? 
          'in_stock' : 'out_of_stock';

        return {
          title,
          price,
          originalPrice,
          image,
          availability
        };
      });

      return {
        ...productData,
        website: 'flipkart',
        url
      };
    } finally {
      await page.close();
    }
  }

  async scrapeEbay(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1[class*="title"]')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();
        
        const priceElement = document.querySelector('[data-testid="price"]') ||
                           document.querySelector('.x-price-primary') ||
                           document.querySelector('.x-price-current');
        
        const price = priceElement ? 
          parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const image = document.querySelector('#icImg')?.src ||
                     document.querySelector('.ux-image-carousel-item img')?.src;
        
        const availability = document.querySelector('button[data-testid="add-to-cart"]') ? 
          'in_stock' : 'out_of_stock';

        return {
          title,
          price,
          image,
          availability
        };
      });

      return {
        ...productData,
        website: 'ebay',
        url
      };
    } finally {
      await page.close();
    }
  }

  async scrapeWalmart(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1[data-testid="product-title"]')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();
        
        const priceElement = document.querySelector('[data-testid="price-wrap"]') ||
                           document.querySelector('.price-characteristic');
        
        const price = priceElement ? 
          parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const image = document.querySelector('[data-testid="hero-image"]')?.src ||
                     document.querySelector('.prod-hero-image img')?.src;
        
        const availability = document.querySelector('button[data-testid="add-to-cart"]') ? 
          'in_stock' : 'out_of_stock';

        return {
          title,
          price,
          image,
          availability
        };
      });

      return {
        ...productData,
        website: 'walmart',
        url
      };
    } finally {
      await page.close();
    }
  }

  async scrapeTarget(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1[data-test="product-title"]')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();
        
        const priceElement = document.querySelector('[data-test="product-price"]') ||
                           document.querySelector('.price-current');
        
        const price = priceElement ? 
          parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
        
        const image = document.querySelector('[data-test="hero-image"]')?.src ||
                     document.querySelector('.hero-image img')?.src;
        
        const availability = document.querySelector('button[data-test="add-to-cart"]') ? 
          'in_stock' : 'out_of_stock';

        return {
          title,
          price,
          image,
          availability
        };
      });

      return {
        ...productData,
        website: 'target',
        url
      };
    } finally {
      await page.close();
    }
  }

  async scrapeGeneric(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Generic selectors for common e-commerce patterns
      const title = $('h1').first().text().trim() ||
                   $('[class*="title"]').first().text().trim() ||
                   $('[class*="product-name"]').first().text().trim();
      
      const priceText = $('[class*="price"]').first().text().trim() ||
                       $('[class*="cost"]').first().text().trim() ||
                       $('[class*="amount"]').first().text().trim();
      
      const price = priceText ? parseFloat(priceText.replace(/[^\d.]/g, '')) : null;
      
      const image = $('img[class*="product"]').first().attr('src') ||
                   $('img[class*="main"]').first().attr('src') ||
                   $('img').first().attr('src');
      
      const availability = $('button[class*="add"]').length > 0 ? 'in_stock' : 'out_of_stock';

      return {
        title,
        price,
        image,
        availability,
        website: this.extractWebsite(url),
        url
      };
    } catch (error) {
      throw new Error(`Failed to scrape generic website: ${error.message}`);
    }
  }

  async updateProductPrice(product) {
    try {
      const scrapedData = await this.scrapeProduct(product.url);
      
      if (scrapedData.price && scrapedData.price !== product.currentPrice) {
        product.addPriceToHistory(scrapedData.price, scrapedData.availability);
        
        // Update other fields if available
        if (scrapedData.title && !product.title) {
          product.title = scrapedData.title;
        }
        if (scrapedData.image && !product.image) {
          product.image = scrapedData.image;
        }
        if (scrapedData.description && !product.description) {
          product.description = scrapedData.description;
        }
        
        await product.save();
        return true; // Price changed
      }
      
      return false; // No price change
    } catch (error) {
      console.error(`Error updating price for ${product.url}:`, error.message);
      throw error;
    }
  }
}

module.exports = new WebScraper(); 