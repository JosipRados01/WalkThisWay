import Profile from './profile';
import ArticlePreview from './articlePreview';
type Comment = {
    id?: number;
    content: string;
    parentCommentId?: number | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    writerId?: number;
    articleId?: number;
    writer: Profile;
    article?: ArticlePreview;
    parentComment?: Comment | null;
    childComments?: Comment[];
};
export default Comment;