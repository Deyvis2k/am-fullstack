import puppeteer from "puppeteer";
import { AmazonProduct } from "../models/AmazonProduct";

class AmazonScrapService {
    private cache: Record<string, AmazonProduct[]> = {};

    public getCache(): Record<string, AmazonProduct[]> {
        return this.cache;
    }

    private alreadyContainItens(
        title: string,
        rating: string,
        price: number | string,
        number_of_reviews: string,
        amazonProducts: AmazonProduct[]
    ): boolean {
        for (const product of amazonProducts) {
            if (
                product.product_title === title &&
                product.rating === rating &&
                product.number_of_reviews === number_of_reviews &&
                product.price === price
            ) {
                return true;
            }
        }
        return false;
    }

    private getNumberOfReviews(review: string): string {
        if (review.includes("Best Seller")) return review;
        const splited = review.split(" ");
        return splited[splited.length - 1] as string;
    }

    public async scrapeAmazon(query: string): Promise<AmazonProduct[]> {
        query = query.trim().toLowerCase();
        if (this.cache[query]) {
            return this.cache[query] as AmazonProduct[];
        }

        const amazonProducts: AmazonProduct[] = [];

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        );
        await page.setViewport({ width: 1280, height: 800 });

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => false,
            });
        });

        let pageNumber = 1;
        const maxPages = 10;

        while (pageNumber <= maxPages) {
            const url = `https://www.amazon.com/s?k=${encodeURIComponent(
                query
            )}&page=${pageNumber}`;
            console.log(`Scraping page ${pageNumber}: ${url}`);

            await page.goto(url, { waitUntil: "networkidle2" });
        
            await new Promise(res => setTimeout(res, 1000 + Math.random() * 2000));

            const products = await page.$$(".s-result-item");

            for (const product of products) {
                const title = await product
                    .$eval(".a-size-medium", (el: any) => el.textContent?.trim())
                    .catch(() => 
                        product.$eval(".a-size-base-plus", (el: any) => el.textContent?.trim()).catch(() => null)
                    );

                let price_str = await product.$eval(".a-offscreen", (el: any) => el.textContent?.trim()).catch(() =>
                    product.$eval(".a-color-base", (el: any) => el.textContent?.trim()).catch(() => "No featured offers available") 
                );

                const rating = await product
                    .$eval(".a-icon-alt", (el: any) => el.textContent?.trim())
                    .catch(() => 
                        product.$eval(".a-popover-trigger", (el: any) => el.getAttribute("aria-label")).catch(() => null)
                    );

                let numberOfReviews = await product
                    .$eval(".a-size-small", (el: any) => el.textContent?.trim())
                    .catch(() => 
                        product.$eval(".a-size-base", (el: any) => el.textContent?.trim()).catch(() => null)
                    );

                const productUrl = await product
                    .$eval("a", (el) => {
                        const href = el.getAttribute("href");
                        if (!href) return null;

                        if (href.startsWith("https://") || href.startsWith("http://")) return href;
                        return "https://amazon.com" + href;
                    })
                    .catch(() => null);

                const imageUrl =
                    (await product
                        .$eval("img", (el) => el.getAttribute("src"))
                        .catch(() => null)) || "";

                let price = 0;
                if (price_str && price_str !== "No featured offers available") {
                    price_str = price_str.replace("$", "").replace(",", "");
                    price = Number(price_str);
                }

                if (numberOfReviews) {
                    numberOfReviews = this.getNumberOfReviews(numberOfReviews);
                }

                if (title && price && rating && numberOfReviews) {
                    if (
                        !this.alreadyContainItens(
                            title,
                            rating,
                            price > 0 ? price : price_str,
                            numberOfReviews,
                            amazonProducts
                        )
                    ) {
                        console.log(
                            `✔️ Found: ${title} | $${price}| ${rating} | ${numberOfReviews}`
                        );

                        amazonProducts.push(
                            new AmazonProduct(
                                title,
                                price > 0 ? price : price_str,
                                rating,
                                numberOfReviews,
                                productUrl,
                                imageUrl
                            )
                        );
                    }
                } else {
                    console.log(
                        `❌ Not found: ${title} | $${price} | ${rating} | ${numberOfReviews}`
                    );
                }
            }

            pageNumber++;
        }

        await browser.close();
        this.cache[query] = amazonProducts;
        return amazonProducts;
    }

    public async getSavedCachedProducts(): Promise<string[]> {
        return Object.keys(this.cache);
    }
}

export { AmazonScrapService };

