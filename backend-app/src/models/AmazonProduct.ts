


class AmazonProduct{
    public product_title: string;
    public price: number | string;
    public rating: string;
    public number_of_reviews: string;
    public product_url: string;
    public product_image_url: string;


    public constructor(
        product_title:      string, 
        price:              number | string, 
        rating:             string, 
        number_of_reviews:  string, 
        product_url:        string,
        product_image_url:  string
    )
    {
        this.product_title = product_title;
        this.price = price;
        this.rating = rating;
        this.number_of_reviews = number_of_reviews;
        this.product_url = product_url;
        this.product_image_url = product_image_url;
    }
}


export {
    AmazonProduct
}
