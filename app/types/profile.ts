import ArticlePreview from './articlePreview';

type Performer = {
    id: number;
    // Add other properties for Performer type
};

type Location = {
    id: number;
    // Add other properties for Location type
};

type Profile = {
    id?: number;
    name: string;
    email?: string;
    password?: string;
    role?: string;
    profilePicture?: string;
    performerId?: number | null;
    locationId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    performer?: Performer | null;
    location?: Location | null;
    articles?: ArticlePreview[];
    comments?: Comment[];
};

export default Profile