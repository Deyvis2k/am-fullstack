import { Request, Response } from "express";
import { AmazonScrapService } from "../services/AmazonScrapService";


const amazonScrapService = new AmazonScrapService();

class AmazonController{
    public async scrapeAmazon(req: Request, res: Response){
        const query = req.query.q as string;
        if(!query){
            return res.status(400).json({
                error: 'Query parameter is required'
            });
        }
        query.trim().toLowerCase();
        const products = await amazonScrapService.scrapeAmazon(query);
        return res.json(products);
    }

    public async getSavedCachedProducts(req: Request, res: Response){
        const products = await amazonScrapService.getSavedCachedProducts();
        return res.json(products);
    }
}


export {
    AmazonController
}
