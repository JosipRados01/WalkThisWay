import ArticlePreview from './articlePreview';

type Category = {
    id: number;
    name: string; 
    articles: ArticlePreview[];
}
export default Category;