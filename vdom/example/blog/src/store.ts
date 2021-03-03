export interface PostState
{
    readonly id: string;
    readonly title: string;
    readonly contents: string;
}

export interface State
{
    readonly posts: PostState[];
}