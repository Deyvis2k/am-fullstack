import {Router, Request, Response} from 'express';
import {AmazonController} from '../controllers/AmazonController';
import {AmazonProduct} from '../models/AmazonProduct';

const router = Router();


router.get('/scrape', async (req: Request, res: Response) => {
    console.log(`Fetching Amazon products..., query: ${req.query.q.toString().trim().toLowerCase()}`);
    const amazonController = new AmazonController();
    await amazonController.scrapeAmazon(req, res);
})

router.get('/products', async (req: Request, res: Response) => {
    const amazonController = new AmazonController();
    await amazonController.getSavedCachedProducts(req, res);
})


export {router as amazonScraperRouter}
